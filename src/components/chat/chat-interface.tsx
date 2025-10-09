
"use client";

import { useState, useEffect, useTransition } from 'react';
import type { ChatMessage, Option } from '@/lib/types';
import * as actions from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ChatMessages } from './chat-messages';
import { TableDisplay } from './table-display';
import { ChartDisplay, RunChartStats } from './chart-display';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

type ConversationStep =
  | 'start'
  | 'po_status_select'
  | 'inspection_details_select_factory'
  | 'inspection_details_select_section'
  | 'inspection_details_select_item'
  | 'inspection_details_select_type'
  | 'inspection_details_select_po'
  | 'param_analysis_select_param'
  | 'param_analysis_select_duration'
  | 'param_dist_select_item'
  | 'param_dist_select_param'
  | 'end';

const MAIN_OPTIONS: Option[] = [
  { label: 'Query PO Status', value: 'po_status' },
  { label: 'Retrieve Inspection Details', value: 'inspection_details' },
  { label: 'Analyze Inspection Parameters', value: 'param_analysis' },
  { label: 'View Parameter Distribution', value: 'param_dist' },
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
    startTransition(() => {
        setIsBotTyping(true);
        actions.getInitialData().then(data => {
            setInitialData(data);
            addBotMessage("Welcome to the Quality Insights Chatbot! How can I assist you today?", MAIN_OPTIONS, handleMainOptionSelect);
        }).finally(() => setIsBotTyping(false));
    });
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
      switch (option.value) {
        case 'po_status':
          setCurrentStep('po_status_select');
          addBotMessage("Please select a Purchase Order number:", initialData.purchaseOrders, handlePoStatusSelect);
          break;
        case 'inspection_details':
          setCurrentStep('inspection_details_select_factory');
          addBotMessage("Let's retrieve inspection details. First, please select a factory:", initialData.factories, handleInspectionDetails);
          break;
        case 'param_analysis':
          setCurrentStep('param_analysis_select_param');
          addBotMessage("Which inspection parameter would you like to analyze?", initialData.parameters, handleParamAnalysis);
          break;
        case 'param_dist':
          setCurrentStep('param_dist_select_item');
          addBotMessage("Let's view a parameter distribution. First, please select an item code:", initialData.itemCodes, handleParamDistribution);
          break;
      }
      setIsBotTyping(false);
    });
  };

  const addUserMessage = (text: string) => {
    addMessage('user', text);
  };
  
  const handlePoStatusSelect = (option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    startTransition(async () => {
      const po = await actions.getPurchaseOrderStatus(option.value);
      if (po) {
        addMessage('bot', <TableDisplay title={`Status for ${po.id}`} headers={['PO ID', 'Item Code', 'Factory ID', 'Status']} rows={[[po.id, po.itemCode, po.factoryId, po.status]]} />)
      } else {
        addBotMessage("Sorry, I couldn't find that purchase order.");
      }
      showEnd();
    });
  }

  const handleInspectionDetails = (option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const newSessionData = { ...sessionData, [currentStep]: option.value };
    setSessionData(newSessionData);
    
    startTransition(async () => {
      switch (currentStep) {
        case 'inspection_details_select_factory':
          setCurrentStep('inspection_details_select_section');
          const sections = await actions.getFactorySections(parseInt(option.value));
          addBotMessage("Great. Now select a section/building:", sections, handleInspectionDetails);
          break;
        case 'inspection_details_select_section':
          setCurrentStep('inspection_details_select_item');
          addBotMessage("Select an item code:", initialData.itemCodes, handleInspectionDetails);
          break;
        case 'inspection_details_select_item':
          setCurrentStep('inspection_details_select_type');
          const types = [{label: 'Inward', value: 'Inward'}, {label: 'In-process', value: 'In-process'}, {label: 'Final', value: 'Final'}];
          addBotMessage("Select an inspection type:", types, handleInspectionDetails);
          break;
        case 'inspection_details_select_type':
            setCurrentStep('inspection_details_select_po');
            addBotMessage("Finally, select a PO Number / Lot No.:", initialData.purchaseOrders, handleInspectionDetails);
            break;
        case 'inspection_details_select_po':
            const filters = {
                factoryId: parseInt(newSessionData.inspection_details_select_factory),
                section: newSessionData.inspection_details_select_section,
                itemCode: newSessionData.inspection_details_select_item,
                type: newSessionData.inspection_details_select_type,
                poId: option.value,
            }
            const inspections = await actions.getFilteredInspections(filters);
            if (inspections.length > 0) {
                const inspectionDetails = inspections.flatMap(i => i.parameters.map(p => [i.id, p.name, p.value, p.unit, p.operator, new Date(p.timestamp).toLocaleString()]));
                addMessage('bot', <TableDisplay title="Inspection Details" headers={['Insp. ID', 'Parameter', 'Value', 'Unit', 'Operator', 'Timestamp']} rows={inspectionDetails} />)
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
            case 'param_analysis_select_param':
                setCurrentStep('param_analysis_select_duration');
                const durations = [{label: 'Last 7 Days', value: '7'}, {label: 'Last 30 Days', value: '30'}, {label: 'Last 90 Days', value: '90'}];
                addBotMessage("Select a duration for the analysis:", durations, handleParamAnalysis);
                break;
            case 'param_analysis_select_duration':
                const result = await actions.getParameterAnalysis(newSessionData.param_analysis_select_param, parseInt(option.value));
                if (result) {
                    addMessage('bot', <div className='space-y-4'><RunChartStats stats={result.stats} /><ChartDisplay type="line" data={result.runChartData} title={`Run Chart for ${newSessionData.param_analysis_select_param}`} /></div>);
                } else {
                    addBotMessage(`No data found for '${newSessionData.param_analysis_select_param}' in the last ${option.label}.`);
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
            case 'param_dist_select_item':
                setCurrentStep('param_dist_select_param');
                addBotMessage("Select a parameter to see its distribution:", initialData.parameters, handleParamDistribution);
                break;
            case 'param_dist_select_param':
                const result = await actions.getParameterDistribution(newSessionData.param_dist_select_item, option.value);
                if (result && result.length > 0) {
                    addMessage('bot', <ChartDisplay type="bar" data={result} title={`Distribution for ${option.label} on ${newSessionData.param_dist_select_item}`} />);
                } else {
                    addBotMessage(`No distribution data found for '${option.label}' on item '${newSessionData.param_dist_select_item}'.`);
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
