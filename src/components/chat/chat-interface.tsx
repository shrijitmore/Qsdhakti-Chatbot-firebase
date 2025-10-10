
"use client";

import { useState, useEffect, useTransition, useRef } from 'react';
import type { ChatMessage, Option } from '@/lib/types';
import * as actions from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessages } from './chat-messages';
import { TableDisplay } from './table-display';
import { ChartDisplay, RunChartStats } from './chart-display';
import { useToast } from '@/hooks/use-toast';

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
  | 'param_analysis_select_section'
  | 'param_analysis_select_item'
  | 'param_analysis_select_operation'
  | 'param_analysis_select_parameter'
  | 'param_analysis_select_duration'
  | 'param_analysis_select_result'
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

// Precompute static initial data once at module load
const STATIC_INITIAL_DATA = actions.getInitialData();

// NumericInput component for typing numeric options
function NumericInput({ 
  options, 
  onSubmit, 
  onError 
}: { 
  options: Option[]; 
  onSubmit: (opt: Option) => void;
  onError: (msg: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      onError('Please enter a value');
      return;
    }

    // Find matching option
    const matchedOption = options.find(
      opt => opt.value.toString().toLowerCase() === trimmedValue.toLowerCase()
    );

    if (matchedOption) {
      setInputValue('');
      onSubmit(matchedOption);
    } else {
      onError(`Invalid input. Please type one of the numbers shown in the options: ${options.map(o => o.value).join(', ')}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type number here..."
        className="flex-1"
        data-testid="numeric-input"
      />
      <Button 
        type="submit" 
        size="sm"
        data-testid="numeric-submit-btn"
      >
        Submit
      </Button>
    </form>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('start');
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const sessionDataRef = useRef<Record<string, any>>({});
  const didInitRef = useRef(false);
  useEffect(() => {
    sessionDataRef.current = sessionData;
  }, [sessionData]);
  
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    setIsBotTyping(true);
    addBotMessage("Welcome to the Quality Insights Chatbot! How can I assist you today?", MAIN_OPTIONS, handleMainOptionSelect);
    setIsBotTyping(false);
  }, []);
  
  const addMessage = (role: 'user' | 'bot', content: React.ReactNode) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, content }]);
  };

  const addBotMessage = (text: string, options: Option[] | null = null, handler: ((option: Option) => void) | null = null) => {
    // Check if all options are numeric and short (≤5 digits)
    const isNumericOptions = options?.every(opt => {
      const val = opt.value.toString();
      return /^\d{1,5}$/.test(val) || /^[A-Z]-\d{1,4}$/.test(val);
    });

    const content = (
      <div>
        <p className="mb-4">{text}</p>
        {options && handler && (
          <div className="space-y-3">
            {/* Show text input for numeric options */}
            {isNumericOptions && (
              <NumericInput 
                options={options} 
                onSubmit={handler}
                onError={(msg) => toast({ 
                  variant: "destructive",
                  title: "Invalid Input", 
                  description: msg 
                })}
              />
            )}
            {/* Always show option buttons */}
            <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                <Button 
                  key={opt.value} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handler(opt)}
                  data-testid={`option-${opt.value}`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
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
    addUserMessage(option.label);
    setIsBotTyping(true);
    startTransition(() => {
      let inspectionType = '';
      if(option.value.includes('inspection')){
        const type = option.value.split('_')[0];
        inspectionType = type.charAt(0).toUpperCase() + type.slice(1);
        if (option.value === 'in_process_inspection') inspectionType = 'In-process';
        setSessionData(prev => ({ ...prev, inspectionType }));
        setCurrentStep('inspection_select_factory');
        addBotMessage(
          `Let's retrieve ${inspectionType} inspection details. First, please select a factory:`,
          STATIC_INITIAL_DATA.factories,
          (opt) => handleInspectionDetails('inspection_select_factory', opt)
        );
        setIsBotTyping(false);
        return;
      }

      switch (option.value) {
        case 'po_status':
          setCurrentStep('po_status_select_factory');
          addBotMessage(
            "Select the factory for which you want to see PO number status.",
            STATIC_INITIAL_DATA.factories,
            (opt) => handlePoStatus('po_status_select_factory', opt)
          );
          break;
        case 'param_analysis':
          setCurrentStep('param_analysis_select_factory');
          addBotMessage(
            "For parameter analysis, first select a factory:",
            STATIC_INITIAL_DATA.factories,
            (opt) => handleParamAnalysis('param_analysis_select_factory', opt)
          );
          break;
        case 'param_dist':
          setCurrentStep('param_dist_select_context');
          const contexts = [{label: 'Inward', value: 'Inward'}, {label: 'In-process', value: 'In-process'}, {label: 'Final', value: 'Final'}];
          addBotMessage(
            "Select the context for distribution:",
            contexts,
            (opt) => handleParamDistribution('param_dist_select_context', opt)
          );
          break;
      }
      setIsBotTyping(false);
    });
  };

  const handlePoStatus = (step: ConversationStep, option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const current = sessionDataRef.current;
    const newSessionData = { ...current, [step]: option.value };
    setSessionData(newSessionData);
    
    startTransition(async () => {
        switch (step) {
            case 'po_status_select_factory':
                setCurrentStep('po_status_select_po');
                const poOptions = STATIC_INITIAL_DATA.purchaseOrders.filter((po: any) => po.factoryId === option.value).map((po: any) => ({ label: po.id, value: po.id }));
                addBotMessage("Select a PO Number:", poOptions, (opt) => handlePoStatus('po_status_select_po', opt));
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

  const handleInspectionDetails = (step: ConversationStep, option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const current = sessionDataRef.current;
    const newSessionData = { ...current, [step]: option.value };
    setSessionData(newSessionData);
    
    startTransition(async () => {
      switch (step) {
        case 'inspection_select_factory':
          setCurrentStep('inspection_select_section');
          const sections = await actions.getFactorySections(parseInt(option.value));
          addBotMessage("Great. Now select a section/building:", sections, (opt) => handleInspectionDetails('inspection_select_section', opt));
          break;
        case 'inspection_select_section':
          setCurrentStep('inspection_select_item');
          const itemCodes = STATIC_INITIAL_DATA.itemCodes.filter((ic: any) => ic.factoryId === newSessionData.inspection_select_factory && ic.section === option.value);
          addBotMessage("Select an item code:", itemCodes, (opt) => handleInspectionDetails('inspection_select_item', opt));
          break;
        case 'inspection_select_item':
          setCurrentStep('inspection_select_po');
          const poOptions = STATIC_INITIAL_DATA.purchaseOrders.filter((po: any) => po.factoryId === newSessionData.inspection_select_factory).map((po: any) => ({ label: po.id, value: po.id }));
          addBotMessage("Finally, select a PO Number / Lot No.:", poOptions, (opt) => handleInspectionDetails('inspection_select_po', opt));
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

  const handleParamAnalysis = (step: ConversationStep, option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const current = sessionDataRef.current;
    const newSessionData = { ...current, [step]: option.value };
    setSessionData(newSessionData);

    startTransition(async () => {
        switch(step) {
            case 'param_analysis_select_factory':
                setCurrentStep('param_analysis_select_section');
                const sections = await actions.getFactorySections(parseInt(option.value));
                addBotMessage("Select a Section/Building/Lab:", sections, (opt) => handleParamAnalysis('param_analysis_select_section', opt));
                break;
            case 'param_analysis_select_section':
                setCurrentStep('param_analysis_select_item');
                const itemCodes = STATIC_INITIAL_DATA.itemCodes.filter((ic: any) => ic.factoryId === newSessionData.param_analysis_select_factory && ic.section === option.value);
                addBotMessage("Select an Item Code:", itemCodes, (opt) => handleParamAnalysis('param_analysis_select_item', opt));
                break;
            case 'param_analysis_select_item':
                setCurrentStep('param_analysis_select_operation');
                const operations = STATIC_INITIAL_DATA.operations.filter((op: any) => op.factoryId === newSessionData.param_analysis_select_factory && op.itemCode === option.value);
                addBotMessage("Select an Operation:", operations, (opt) => handleParamAnalysis('param_analysis_select_operation', opt));
                break;
            case 'param_analysis_select_operation':
                setCurrentStep('param_analysis_select_parameter');
                const parameters = STATIC_INITIAL_DATA.parameters.filter((p: any) => p.factoryId === newSessionData.param_analysis_select_factory && p.itemCode === newSessionData.param_analysis_select_item);
                addBotMessage("Select an Inspection Parameter:", parameters, (opt) => handleParamAnalysis('param_analysis_select_parameter', opt));
                break;
            case 'param_analysis_select_parameter':
                setCurrentStep('param_analysis_select_duration');
                const durations: Option[] = [
                  { label: 'Last 7 days', value: '7' },
                  { label: 'Last 30 days', value: '30' },
                  { label: 'Last 90 days', value: '90' },
                  { label: 'All time', value: '0' },
                ];
                addBotMessage("Select duration for analysis:", durations, (opt) => handleParamAnalysis('param_analysis_select_duration', opt));
                break;
            case 'param_analysis_select_duration':
                setCurrentStep('param_analysis_select_result');
                const resultTypes: Option[] = [
                  { label: 'Inspection parameters results', value: 'results_table' },
                  { label: 'Average of the reading', value: 'avg' },
                  { label: 'Run chart of the reading', value: 'run_chart' },
                  { label: 'Minimum & Maximum reading', value: 'min_max' },
                  { label: 'Which reading fall outside specification', value: 'oos' },
                  { label: 'Who was the operator at that time', value: 'operators' },
                  { label: 'Operation-wise LSL/USL distribution chart', value: 'dist_chart' },
                ];
                addBotMessage("What do you want to see in the result?", resultTypes, (opt) => handleParamAnalysis('param_analysis_select_result', opt));
                break;
            case 'param_analysis_select_result': {
                const days = parseInt(newSessionData.param_analysis_select_duration || '0') || undefined;
                const factoryId = parseInt(newSessionData.param_analysis_select_factory);
                const itemCode = newSessionData.param_analysis_select_item;
                const operation = newSessionData.param_analysis_select_operation;
                const parameter = newSessionData.param_analysis_select_parameter;

                if (option.value === 'dist_chart') {
                  const dist = await actions.getLSLUSLDistribution(factoryId, itemCode, operation, parameter, days);
                  addMessage('bot', (
                    <ChartDisplay
                      type="bar"
                      data={dist.data}
                      title={`Operation Wise - ${operation}`}
                      xAxisLabel={dist.xAxisLabel}
                      yAxisLabel={dist.yAxisLabel}
                    />
                  ));
                  showEnd();
                  break;
                }

                const analysis = await actions.getParameterSeriesAndStats(factoryId, itemCode, operation, parameter, days);

                switch (option.value) {
                  case 'results_table': {
                    const rows = analysis.readings.map((r) => [new Date(r.timestamp).toLocaleString(), r.value, analysis.stats.unit || '', r.operator, r.status]);
                    addMessage('bot', (
                      <TableDisplay
                        title={`Readings for ${parameter}`}
                        headers={['Timestamp', 'Value', 'Unit', 'Operator', 'Status']}
                        rows={rows}
                      />
                    ));
                    break;
                  }
                  case 'avg': {
                    const rows = [[ 'Average Reading', analysis.stats.avg ]];
                    addMessage('bot', <TableDisplay title={`Average for ${parameter}`} headers={['Metric', 'Value']} rows={rows} />);
                    break;
                  }
                  case 'min_max': {
                    const rows = [[ 'Min Reading', analysis.stats.min ], [ 'Max Reading', analysis.stats.max ]];
                    addMessage('bot', <TableDisplay title={`Min/Max for ${parameter}`} headers={['Metric', 'Value']} rows={rows} />);
                    break;
                  }
                  case 'oos': {
                    if (analysis.oos.length === 0) {
                      addBotMessage('No readings fall outside the specification range.');
                    } else {
                      const rows = analysis.oos.map((r) => [new Date(r.timestamp).toLocaleString(), r.value, r.operator]);
                      addMessage('bot', <TableDisplay title={`Out-of-spec Readings for ${parameter}`} headers={['Timestamp', 'Value', 'Operator']} rows={rows} />);
                    }
                    break;
                  }
                  case 'operators': {
                    const rows = analysis.readings.map((r) => [new Date(r.timestamp).toLocaleString(), r.operator, r.value]);
                    addMessage('bot', <TableDisplay title={`Operators for ${parameter}`} headers={['Timestamp', 'Operator', 'Value']} rows={rows} />);
                    break;
                  }
                  case 'run_chart':
                  default: {
                    addMessage('bot', (
                      <div className="grid gap-4">
                        <ChartDisplay
                          type="line"
                          data={analysis.series}
                          title={`${parameter} - Run Chart`}
                          xAxisLabel="Time"
                          yAxisLabel={analysis.stats.unit ? `${analysis.stats.unit}` : 'Value'}
                          refLines={{ lsl: analysis.spec.lsl, usl: analysis.spec.usl, target: analysis.spec.target }}
                        />
                        <RunChartStats stats={{ min: analysis.stats.min, max: analysis.stats.max, avg: analysis.stats.avg, count: analysis.stats.count }} />
                      </div>
                    ));
                    break;
                  }
                }
                showEnd();
                break;
            }
        }
        setIsBotTyping(false);
    });
  }
  
  const handleParamDistribution = (step: ConversationStep, option: Option) => {
    addUserMessage(option.label);
    setIsBotTyping(true);
    const current = sessionDataRef.current;
    const newSessionData = { ...current, inspectionType: current.inspectionType || '', [step]: option.value };
    setSessionData(newSessionData);

    startTransition(async () => {
        switch(step) {
            case 'param_dist_select_context':
                addBotMessage("Select a Factory:", STATIC_INITIAL_DATA.factories, (opt) => handleParamDistribution('param_dist_select_factory', opt));
                break;
            case 'param_dist_select_factory':
                setCurrentStep('param_dist_select_section');
                const sections = await actions.getFactorySections(parseInt(option.value));
                addBotMessage("Select a Section/Building/Lab:", sections, (opt) => handleParamDistribution('param_dist_select_section', opt));
                break;
            case 'param_dist_select_section':
                setCurrentStep('param_dist_select_item');
                const itemCodes = STATIC_INITIAL_DATA.itemCodes.filter((ic: any) => ic.factoryId === newSessionData.param_dist_select_factory && ic.section === option.value);
                addBotMessage("Select an Item Code:", itemCodes, (opt) => handleParamDistribution('param_dist_select_item', opt));
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
