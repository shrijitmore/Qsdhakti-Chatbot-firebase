
"use client";

import { useState, useEffect, useTransition } from 'react';
import type { ChatMessage, Option } from '@/lib/types';
import * as actions from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ChatMessages } from './chat-messages';
import { TableDisplay } from './table-display';
import { BotCard } from './bot-card';

type ConversationStep =
  | 'start'
  | 'po_status_select_factory'
  | 'po_status_select_po'
  | 'inspection_select_type'
  | 'inspection_select_factory'
  | 'inspection_select_section'
  | 'inspection_select_item'
  | 'inspection_select_po'
  | 'param_analysis_select_factory'
  | 'param_analysis_select_item'
  | 'param_analysis_select_operation'
  | 'param_analysis_select_parameter'
  | 'param_dist_select_context'
  | 'param_dist_select_factory'
  | 'param_dist_select_section'
  | 'param_dist_select_item'
  | 'end';

const MAIN_OPTIONS: Option[] = [
  { label: 'Production Order (PO) Status', value: 'po_status' },
  { label: 'Inward Material Quality Inspection', value: 'inward_inspection' },
  { label: 'In-process Inspection', value: 'in_process_inspection' },
  { label: 'Final Inspection / FAI Inspection Details', value: 'final_inspection' },
  { label: 'Inspection Parameter Wise Analysis', value: 'param_analysis' },
  { label: 'Distribution of Captured Inspection Parameter', value: 'param_dist' },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('start');
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [initialData, setInitialData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setIsBotTyping(true);
    actions.getInitialData().then(data => {
      setInitialData(data);
      addBotMessage("Welcome to the Quality Insights Chatbot! How can I assist you today?", MAIN_OPTIONS, handleMainOptionSelect);
    }).finally(() => setIsBotTyping(false));
  }, []);

  const addMessage = (role: 'user' | 'bot', content: React.ReactNode) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, content }]);
  };

  const addBotMessage = (text: string, options: Option[] | null = null, handler: ((option: Option) => void) | null = null) => {
    const content = (
      <div>
        <p className="mb-4">{text}</p>
        {options && handler && (
          <div className="flex flex-wrap gap-2">
            {options.map(opt => (
              <Button key={opt.value} variant="outline" size="sm" onClick={() => handler(opt)} disabled={isPending}>
                {opt.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
    addMessage('bot', content);
  };

  const addUserMessage = (text: string) => {
    addMessage('user', text);
  };
  
  const handleMainOptionSelect = (option: Option) => {
    if (!initialData) {
      toast({
        variant: "destructive",
        title: "Still loading.",
        description: "Initial data is still being loaded, please try again in a moment.",
      });
      return;
    }
    addUserMessage(option.label);
    setIsBotTyping(true);
    startTransition(() => {
      let inspectionType = '';
      if(option.value.includes('inspection')){
        const type = option.value.split('_')[0];
        inspectionType = type.charAt(0).toUpperCase() + type.slice(1);
        if (option.value === 'in_process_inspection') inspectionType = 'In-process';
        setSessionData({ inspectionType });
        setCurrentStep('inspection_select_factory');
        addBotMessage(`Let's retrieve ${inspectionType} inspection details. First, please select a factory:`, initialData.factories, handleInspectionDetails);
        setIsBotTyping(false);
        return;
      }

      switch (option.value) {
        case 'po_status':
          setCurrentStep('po_status_select_factory');
          addBotMessage("Select the factory for which you want to see PO number status.", initialData.factories, handlePoStatus);
          break;
        case 'param_analysis':
          setCurrentStep('param_analysis_select_factory');
          addBotMessage("For parameter analysis, first select a factory:", initialData.factories, handleParamAnalysis);
          break;
        case 'param_dist':
          setCurrentStep('param_dist_select_context');
          const contexts = [{label: 'Inward', value: 'Inward'}, {label: 'In-process', value: 'In-process'}, {label: 'Final', value: 'Final'}];
          addBotMessage("Select the context for distribution:", contexts, handleParamDistribution);
          break;
      }
      setIsBotTyping(false);
    });
  };

  const handlePoStatus = (option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const newSessionData = { ...sessionData, [currentStep]: option.value };
    setSessionData(newSessionData);
    
    startTransition(async () => {
        switch (currentStep) {
            case 'po_status_select_factory':
                setCurrentStep('po_status_select_po');
                const poOptions = initialData.purchaseOrders.filter((po: any) => po.factoryId === option.value).map((po: any) => ({ label: po.id, value: po.id }));
                addBotMessage("Select a PO Number:", poOptions, handlePoStatus);
                break;
            case 'po_status_select_po':
                const result = await actions.getPurchaseOrderStatus(option.value);
                if (result) {
                    const rows = Object.entries(result).map(([key, value]) => [key, value]);
                    addMessage('bot', <TableDisplay title={`Status for PO ${option.value}`} headers={['Property', 'Value']} rows={rows} />);
                } else {
                    addBotMessage(`Sorry, I couldn't find details for PO ${option.value}.`);
                }
                showEnd();
                break;
        }
        setIsBotTyping(false);
    });
  };

  const handleInspectionDetails = (option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const newSessionData = { ...sessionData, [currentStep]: option.value };
    setSessionData(newSessionData);
    
    startTransition(async () => {
      switch (currentStep) {
        case 'inspection_select_factory':
          setCurrentStep('inspection_select_section');
          const sections = await actions.getFactorySections(parseInt(option.value));
          addBotMessage("Great. Now select a section/building:", sections, handleInspectionDetails);
          break;
        case 'inspection_select_section':
          setCurrentStep('inspection_select_item');
          const itemCodes = initialData.itemCodes.filter((ic: any) => ic.factoryId === newSessionData.inspection_select_factory && ic.section === option.value);
          addBotMessage("Select an item code:", itemCodes, handleInspectionDetails);
          break;
        case 'inspection_select_item':
          setCurrentStep('inspection_select_po');
          const poOptions = initialData.purchaseOrders.filter((po: any) => po.factoryId === newSessionData.inspection_select_factory).map((po: any) => ({ label: po.id, value: po.id }));
          addBotMessage("Finally, select a PO Number / Lot No.:", poOptions, handleInspectionDetails);
          break;
        case 'inspection_select_po':
            const filters = {
                factoryId: parseInt(newSessionData.inspection_select_factory),
                section: newSessionData.inspection_select_section,
                itemCode: newSessionData.inspection_select_item,
                type: newSessionData.inspectionType,
                poId: option.value,
            }
            const inspections = await actions.getFilteredInspections(filters);
            if (inspections.length > 0) {
                const inspectionDetails = inspections.flatMap(i => i.parameters.map(p => [i.id, i.operationName || 'N/A', p.name, p.value, p.unit, new Date(p.timestamp).toLocaleString()]));
                addMessage('bot', <TableDisplay title="Inspection Details" headers={['Insp. ID', 'Operation', 'Parameter', 'Value', 'Unit', 'Timestamp']} rows={inspectionDetails} />)
            } else {
                addBotMessage("No inspection records found for the selected criteria.");
            }
            showEnd();
            break;
      }
      setIsBotTyping(false);
    });
  }

  const handleParamAnalysis = (option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const newSessionData = { ...sessionData, [currentStep]: option.value };
    setSessionData(newSessionData);

    startTransition(async () => {
        switch(currentStep) {
            case 'param_analysis_select_factory':
                setCurrentStep('param_analysis_select_item');
                const itemCodes = initialData.itemCodes.filter((ic: any) => ic.factoryId === option.value);
                addBotMessage("Select an Item Code:", itemCodes, handleParamAnalysis);
                break;
            case 'param_analysis_select_item':
                setCurrentStep('param_analysis_select_operation');
                const operations = initialData.operations.filter((op: any) => op.factoryId === newSessionData.param_analysis_select_factory && op.itemCode === option.value);
                addBotMessage("Select an Operation:", operations, handleParamAnalysis);
                break;
            case 'param_analysis_select_operation':
                setCurrentStep('param_analysis_select_parameter');
                const parameters = initialData.parameters.filter((p: any) => p.factoryId === newSessionData.param_analysis_select_factory && p.itemCode === newSessionData.param_analysis_select_item);
                addBotMessage("Select an Inspection Parameter:", parameters, handleParamAnalysis);
                break;
            case 'param_analysis_select_parameter':
                const result = await actions.getParameterAnalysis(
                    parseInt(newSessionData.param_analysis_select_factory),
                    newSessionData.param_analysis_select_item,
                    newSessionData.param_analysis_select_operation,
                    option.value
                );
                if (result) {
                    const rows = Object.entries(result).map(([key, value]) => [key, value]);
                    addMessage('bot', <TableDisplay title={`Analysis for ${option.label}`} headers={['Metric', 'Value']} rows={rows} />);
                } else {
                    addBotMessage(`No analysis found for the selected criteria.`);
                }
                showEnd();
                break;
        }
        setIsBotTyping(false);
    });
  }
  
  const handleParamDistribution = (option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const newSessionData = { ...sessionData, [currentStep]: option.value };
    setSessionData(newSessionData);

    startTransition(async () => {
        switch(currentStep) {
            case 'param_dist_select_context':
                setCurrentStep('param_dist_select_factory');
                addBotMessage("Select a Factory:", initialData.factories, handleParamDistribution);
                break;
            case 'param_dist_select_factory':
                setCurrentStep('param_dist_select_section');
                const sections = await actions.getFactorySections(parseInt(option.value));
                addBotMessage("Select a Section/Building/Lab:", sections, handleParamDistribution);
                break;
            case 'param_dist_select_section':
                setCurrentStep('param_dist_select_item');
                const itemCodes = initialData.itemCodes.filter((ic: any) => ic.factoryId === newSessionData.param_dist_select_factory && ic.section === option.value);
                addBotMessage("Select an Item Code:", itemCodes, handleParamDistribution);
                break;
            case 'param_dist_select_item':
                const result = await actions.getParameterDistribution(
                    newSessionData.param_dist_select_context,
                    parseInt(newSessionData.param_dist_select_factory),
                    newSessionData.param_dist_select_section,
                    option.value
                );
                if (result) {
                    const rows = Object.entries(result).map(([key, value]) => [key, value]);
                    addMessage('bot', <TableDisplay title={`Distribution for ${option.label}`} headers={['Category', 'Details']} rows={rows} />);
                } else {
                    addBotMessage(`No distribution data found for '${option.label}'.`);
                }
                showEnd();
                break;
        }
        setIsBotTyping(false);
    });
  }

  const showEnd = () => {
    setSessionData({});
    setCurrentStep('end');
    setIsBotTyping(true);
    setTimeout(() => {
        addBotMessage("Is there anything else I can help you with?", MAIN_OPTIONS, handleMainOptionSelect);
        setIsBotTyping(false);
    }, 1000);
  }

  return (
    <div className="h-full flex flex-col">
      <ChatMessages messages={messages} isBotTyping={isBotTyping || isPending} className="flex-1" />
    </div>
  );
}
