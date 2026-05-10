import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { ArrowLeft, Mic, Check, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { parseSpeechToItems } from '../../../utils/speechParser';

interface RowItem {
  itemName: string;
  count: string;
  unit: string;
  category: string;
}

const EMPTY_ROW: RowItem = { itemName: '', count: '', unit: '', category: '' };

// ─── Web Speech API hook ──────────────────────────────────────────────────────

function useSpeechRecognition(onResult: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!supported) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    const SR = (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition);
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += text;
        else interim += text;
      }
      setInterimText(interim || final);
      if (final) {
        setInterimText('');
        onResult(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        toast.error(`Microphone error: ${event.error}`);
      }
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported, onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText('');
  }, []);

  return { isListening, interimText, supported, start, stop };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VolunteerItemsEntry() {
  const navigate = useNavigate();
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { user, addRecentlyViewed } = useUser();
  const { shipments, saveVolunteerEntry } = useData();

  const [items, setItems] = useState<RowItem[]>([{ ...EMPTY_ROW }]);
  const [saving, setSaving] = useState(false);

  const shipment = shipments.find(s => s.id === shipmentId);

  useEffect(() => {
    if (shipment) addRecentlyViewed({ id: shipment.id, name: shipment.name });
  }, [shipment, addRecentlyViewed]);

  // ─── STT handler: appends parsed items as new rows ─────────────────────────
  const handleTranscript = useCallback((transcript: string) => {
    const parsed = parseSpeechToItems(transcript);

    if (parsed.length === 0) {
      toast.warning(`Could not parse: "${transcript}"`, {
        description: 'Try: "24 apples" or "5 cans of soup"',
      });
      return;
    }

    setItems(prev => {
      // Remove trailing empty row so we don't accumulate blank rows
      const nonEmpty = prev.filter(r => r.itemName || r.count);
      const newRows: RowItem[] = parsed.map(p => ({
        itemName: p.itemName,
        count: String(p.count),
        unit: p.unit,
        category: '',
      }));
      return [...nonEmpty, ...newRows, { ...EMPTY_ROW }];
    });

    const summary = parsed.map(p => `${p.count} ${p.unit} of ${p.itemName}`).join(', ');
    toast.success(`Added: ${summary}`);
  }, []);

  const { isListening, interimText, supported, start, stop } = useSpeechRecognition(handleTranscript);

  const handleMicClick = () => (isListening ? stop() : start());

  // ─── Manual row editing ────────────────────────────────────────────────────
  const handleItemChange = (index: number, field: keyof RowItem, value: string) => {
    setItems(prev => {
      const updated = prev.map((row, i) => i === index ? { ...row, [field]: value } : row);
      // Auto-add a new blank row when the last row gets any input
      if (index === prev.length - 1 && value) {
        return [...updated, { ...EMPTY_ROW }];
      }
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ ...EMPTY_ROW }]);
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validItems = items
      .filter(row => row.itemName.trim() && row.count)
      .map(row => ({
        itemName: row.itemName.trim(),
        count: parseFloat(row.count) || 0,
        unit: row.unit.trim() || 'count',
        category: row.category.trim() || 'General',
      }));

    if (validItems.length === 0) {
      toast.error('No items to save. Add at least one item first.');
      return;
    }

    try {
      setSaving(true);
      await saveVolunteerEntry(shipmentId!, user?.name || 'Volunteer', validItems);
      toast.success(`Saved ${validItems.length} item${validItems.length !== 1 ? 's' : ''}!`);
      navigate('/volunteer');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'V';

  return (
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FDFFEC' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/volunteer')}
          className="w-12 h-12 hover:opacity-80"
          style={{ backgroundColor: '#9B9B9B' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#6B6B6B' }}>{shipment?.date}</p>
          <p className="font-medium" style={{ color: '#1F1F1F' }}>{shipment?.name ?? 'Items'}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-14 h-14" style={{ backgroundColor: '#9B9B9B' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#9B9B9B' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs mt-1" style={{ color: '#1F1F1F' }}>Volunteer</span>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-px text-sm font-medium px-2 py-2 sticky top-0 z-10"
        style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 2rem', backgroundColor: '#E8E8E8', color: '#1F1F1F' }}
      >
        <div className="pl-2">Item</div>
        <div>Count</div>
        <div>Unit</div>
        <div>Category</div>
        <div />
      </div>

      {/* Rows */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-px bg-gray-200 pb-2">
          {items.map((row, index) => (
            <div
              key={index}
              className="grid gap-px bg-white"
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 2rem' }}
            >
              <Input
                type="text"
                inputMode="text"
                value={row.itemName}
                onChange={e => handleItemChange(index, 'itemName', e.target.value)}
                className="border-none rounded-none h-11"
                placeholder="Item name"
              />
              <Input
                type="number"
                inputMode="decimal"
                value={row.count}
                onChange={e => handleItemChange(index, 'count', e.target.value)}
                className="border-none rounded-none h-11"
                placeholder="0"
              />
              <Input
                type="text"
                inputMode="text"
                value={row.unit}
                onChange={e => handleItemChange(index, 'unit', e.target.value)}
                className="border-none rounded-none h-11"
                placeholder="count"
              />
              <Input
                type="text"
                inputMode="text"
                value={row.category}
                onChange={e => handleItemChange(index, 'category', e.target.value)}
                className="border-none rounded-none h-11"
                placeholder="General"
              />
              <button
                onClick={() => handleRemoveRow(index)}
                className="flex items-center justify-center text-gray-400 hover:text-red-500 text-lg"
                aria-label="Remove row"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {/* STT status bar */}
      {(isListening || interimText) && (
        <div
          className="px-4 py-3 text-sm text-center"
          style={{ backgroundColor: '#FAA308', color: '#ffffff' }}
        >
          {interimText ? `"${interimText}"` : 'Listening… speak now'}
        </div>
      )}

      {/* Footer: mic + submit */}
      <div className="p-4 bg-white border-t">
        {!supported && (
          <p className="text-xs text-center mb-2" style={{ color: '#6B6B6B' }}>
            Speech recognition not available in this browser.
          </p>
        )}

        {/* Help tooltip */}
        <p className="text-xs text-center mb-3" style={{ color: '#6B6B6B' }}>
          Say the item and amount — e.g. <em>"24 apples"</em> or <em>"5 cans of soup"</em>
        </p>

        <div className="flex items-center justify-center gap-6">
          <Button
            onClick={handleMicClick}
            disabled={!supported}
            size="icon"
            className="w-20 h-20 rounded-full transition-colors"
            style={{
              backgroundColor: isListening ? '#d4183d' : '#FAA308',
            }}
          >
            {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            size="icon"
            className="w-20 h-20 rounded-full"
            style={{ backgroundColor: '#9ABB39' }}
          >
            <Check className="w-8 h-8 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
