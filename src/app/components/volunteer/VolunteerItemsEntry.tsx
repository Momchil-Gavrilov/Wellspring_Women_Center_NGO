import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useUser } from '../../context/UserContext';
import { useData } from '../../context/DataContext';
import { Mic, Check, MicOff } from 'lucide-react';
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
  const { shipments, saveVolunteerEntry, getShipmentEntries } = useData();

  const [items, setItems] = useState<RowItem[]>([{ ...EMPTY_ROW }]);
  const [saving, setSaving] = useState(false);

  const shipment = shipments.find(s => s.id === shipmentId);

  useEffect(() => {
    if (shipment) addRecentlyViewed({ id: shipment.id, name: shipment.name });
  }, [shipment, addRecentlyViewed]);

  // Pre-populate rows with the current volunteer's existing entries for this shipment
  useEffect(() => {
    if (!shipmentId || !user?.name) return;
    getShipmentEntries(shipmentId)
      .then(allEntries => {
        const myEntry = allEntries.find(e => e.volunteerName === user.name);
        if (myEntry && myEntry.items.length > 0) {
          setItems([
            ...myEntry.items.map(item => ({
              itemName: item.itemName,
              count: String(item.count),
              unit: item.unit,
              category: item.category,
            })),
            { ...EMPTY_ROW },
          ]);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId, user?.name]);

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
    <div className="size-full flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
        <button
          onClick={() => navigate('/volunteer')}
          className="flex items-center justify-center w-10 h-10 hover:opacity-70"
          style={{ backgroundColor: '#BDBDBD', color: '#fff', fontSize: 18, borderRadius: 6 }}
        >
          {'←'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#6B6B6B' }}>{shipment?.date}</p>
          <p className="font-medium" style={{ color: '#1F1F1F' }}>{shipment?.name ?? 'Items'}</p>
        </div>

        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar className="w-12 h-12" style={{ backgroundColor: '#BDBDBD' }}>
            <AvatarFallback className="text-white" style={{ backgroundColor: '#BDBDBD' }}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs mt-1" style={{ color: '#1F1F1F' }}>Volunteer</span>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid text-sm font-medium px-2 py-3"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1.5fr 2rem',
          backgroundColor: '#EEF0F3',
          color: '#3B3B3B',
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <div className="pl-2">Item</div>
        <div>Count</div>
        <div>Unit</div>
        <div>Category</div>
        <div />
      </div>

      {/* Rows */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {items.map((row, index) => (
            <div
              key={index}
              className="grid"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1.5fr 2rem',
                borderBottom: '1px solid #F0F0F0',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Input
                type="text"
                inputMode="text"
                value={row.itemName}
                onChange={e => handleItemChange(index, 'itemName', e.target.value)}
                className="border-none h-11 rounded-none bg-transparent"
                placeholder="Item name"
              />
              <Input
                type="number"
                inputMode="decimal"
                value={row.count}
                onChange={e => handleItemChange(index, 'count', e.target.value)}
                className="border-none h-11 rounded-none bg-transparent"
                placeholder="0"
              />
              <Input
                type="text"
                inputMode="text"
                value={row.unit}
                onChange={e => handleItemChange(index, 'unit', e.target.value)}
                className="border-none h-11 rounded-none bg-transparent"
                placeholder="count"
              />
              <Input
                type="text"
                inputMode="text"
                value={row.category}
                onChange={e => handleItemChange(index, 'category', e.target.value)}
                className="border-none h-11 rounded-none bg-transparent"
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

      {/* Footer: info box + mic + submit */}
      <div className="p-5 bg-white border-t border-gray-100">
        {!supported && (
          <p className="text-xs text-center mb-2" style={{ color: '#6B6B6B' }}>
            Speech recognition not available in this browser.
          </p>
        )}

        {/* Info box */}
         
        {/* <div
          className="mx-auto mb-5 px-5 py-4 text-sm text-center max-w-xs"
          style={{ backgroundColor: '#3D5166', color: '#FFFFFF', borderRadius: 8 }}
        >
          To use speech-to-text, simply name the item and the amount! The system will fill in the rest.
        </div>  */}
        

        <div className="flex items-center justify-center gap-8">
          <Button
            onClick={handleMicClick}
            disabled={!supported}
            size="icon"
            className="w-16 h-16 rounded-full transition-colors"
            style={{ backgroundColor: isListening ? '#d4183d' : '#3D5166' }}
          >
            {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            size="icon"
            className="w-16 h-16 rounded-full"
            style={{ backgroundColor: '#FAA308' }}
          >
            <Check className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
