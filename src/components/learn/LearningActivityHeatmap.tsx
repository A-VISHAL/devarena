import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Flame, 
  Zap, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  BookOpen, 
  Code2,
  Sparkles,
  Info
} from 'lucide-react';
import { getAnnualHeatmapData } from '../../services/learningActivityService';
import { DayContribution } from '../../types/learn';
import { sound } from '../../utils/sound';

interface LearningActivityHeatmapProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  initialYear?: number;
  onSelectDate?: (day: DayContribution) => void;
}

export const LearningActivityHeatmap: React.FC<LearningActivityHeatmapProps> = ({
  title = "Annual Learning Activity",
  subtitle = "Contribution activity across algorithms, problem solving, and roadmap lessons.",
  compact = false,
  initialYear = 2026,
  onSelectDate
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [hoveredDay, setHoveredDay] = useState<{ day: DayContribution; x: number; y: number } | null>(null);
  const [activeDayModal, setActiveDayModal] = useState<DayContribution | null>(null);

  const heatmap = useMemo(() => {
    return getAnnualHeatmapData(selectedYear);
  }, [selectedYear]);

  // Weekday labels
  const weekdayLabels = [
    { label: '', row: 0 },
    { label: 'Mon', row: 1 },
    { label: '', row: 2 },
    { label: 'Wed', row: 3 },
    { label: '', row: 4 },
    { label: 'Fri', row: 5 },
    { label: '', row: 6 },
  ];

  const handleCellClick = (day: DayContribution) => {
    sound.playClick();
    setActiveDayModal(day);
    if (onSelectDate) onSelectDate(day);
  };

  const getCellColorClass = (intensity: number) => {
    switch (intensity) {
      case 4:
        return 'bg-[#39D353] border-[#39D353]/80 shadow-[0_0_6px_rgba(57,211,83,0.4)]';
      case 3:
        return 'bg-[#26A641] border-[#26A641]/80';
      case 2:
        return 'bg-[#006D32] border-[#006D32]/80';
      case 1:
        return 'bg-[#0E4429] border-[#0E4429]/80';
      default:
        return 'bg-[#151D20] border-[#222E32] hover:border-[#384A50]';
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl bg-[#141A1C] border border-[#253235] p-5 sm:p-6 space-y-5 select-none relative">
      
      {/* Header and Year Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#222E31]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B5FF4A]" />
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B5FF4A]/10 text-[#B5FF4A] border border-[#B5FF4A]/30 font-semibold">
              {heatmap.totalContributions} Contributions
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-[#8A999E] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Year Pills Navigation */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#101416] p-1 rounded-xl border border-[#253235]">
          {[2026, 2025, 2024].map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => {
                  sound.playClick();
                  setSelectedYear(yr);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1F2B2E] text-[#B5FF4A] border border-[#B5FF4A]/40 shadow-sm'
                    : 'text-[#8A999E] hover:text-white hover:bg-[#182124]'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
          <span className="text-[10px] uppercase font-mono text-[#78888D] block">ACTIVE DAYS</span>
          <span className="text-lg font-bold text-white font-mono mt-0.5 block">
            {heatmap.activeDays} <span className="text-[11px] font-normal text-[#78888D]">/ 365</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
          <span className="text-[10px] uppercase font-mono text-[#78888D] flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#FFAD42]" />
            <span>CURRENT STREAK</span>
          </span>
          <span className="text-lg font-bold text-[#FFAD42] font-mono mt-0.5 block">
            {heatmap.currentStreak} Days
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
          <span className="text-[10px] uppercase font-mono text-[#78888D] flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#B5FF4A]" />
            <span>LONGEST STREAK</span>
          </span>
          <span className="text-lg font-bold text-[#B5FF4A] font-mono mt-0.5 block">
            {heatmap.longestStreak} Days
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31]">
          <span className="text-[10px] uppercase font-mono text-[#78888D] block">YEAR ACTIVITY</span>
          <span className="text-lg font-bold text-[#00E5FF] font-mono mt-0.5 block">
            {heatmap.totalContributions} <span className="text-[11px] font-normal text-[#78888D]">points</span>
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container with Horizontal Scroll */}
      <div className="relative overflow-x-auto pb-2 pt-1 scrollbar-thin">
        <div className="min-w-[760px] space-y-1.5">
          
          {/* Month Label Row */}
          <div className="flex text-[10px] font-mono text-[#78888D] pl-8">
            {heatmap.monthHeaders.map((m, idx) => (
              <div 
                key={idx} 
                className="text-left font-semibold"
                style={{ 
                  width: `${(idx === heatmap.monthHeaders.length - 1 ? 4 : (heatmap.monthHeaders[idx + 1]?.weekIndex - m.weekIndex || 4)) * 14}px` 
                }}
              >
                {m.month}
              </div>
            ))}
          </div>

          {/* Main Grid: 7 Rows (Weekdays) x 53 Columns (Weeks) */}
          <div className="flex gap-1 items-start">
            
            {/* Weekday Labels Column */}
            <div className="flex flex-col gap-1 w-7 pr-1 shrink-0 text-[9px] font-mono text-[#6E7F84]">
              {weekdayLabels.map((lbl, rIdx) => (
                <div key={rIdx} className="h-2.5 flex items-center justify-end leading-none">
                  {lbl.label}
                </div>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {heatmap.weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const isHovered = hoveredDay?.day.date === day.date;
                    const cellColor = getCellColorClass(day.intensity);

                    return (
                      <div
                        key={day.date}
                        onClick={() => handleCellClick(day)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({ day, x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-2.5 h-2.5 rounded-[2px] border transition-transform cursor-pointer ${cellColor} ${
                          isHovered ? 'scale-150 z-20 ring-1 ring-white' : ''
                        }`}
                        title={`${formatTooltipDate(day.date)}: ${day.count} activities`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div 
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#12181A] border border-[#2B3B3F] p-2.5 rounded-xl shadow-2xl text-left text-xs space-y-1 min-w-[200px] animate-in fade-in"
          style={{ left: hoveredDay.x, top: hoveredDay.y - 8 }}
        >
          <div className="font-bold text-white border-b border-[#202C2F] pb-1 font-mono text-[11px]">
            {formatTooltipDate(hoveredDay.day.date)}
          </div>
          <div className="text-[11px] text-[#8A999E]">
            {hoveredDay.day.count > 0 ? (
              <span className="text-[#B5FF4A] font-bold">{hoveredDay.day.count} activity points recorded</span>
            ) : (
              <span className="text-[#6E7F84]">No learning activity recorded</span>
            )}
          </div>
          {hoveredDay.day.count > 0 && (
            <div className="space-y-0.5 pt-1 text-[10px] text-[#A2B1B6] font-mono">
              {hoveredDay.day.problemsSolved > 0 && (
                <div>• {hoveredDay.day.problemsSolved} problem(s) solved</div>
              )}
              {hoveredDay.day.lessonsCompleted > 0 && (
                <div>• {hoveredDay.day.lessonsCompleted} lesson(s) completed</div>
              )}
              {hoveredDay.day.topicsStudied > 0 && (
                <div>• {hoveredDay.day.topicsStudied} topic(s) explored</div>
              )}
            </div>
          )}
          <div className="text-[9px] text-[#00E5FF] pt-0.5">Click for breakdown</div>
        </div>
      )}

      {/* Footer Controls & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-[#202C2F] text-[#8A999E]">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Counts genuine problem submissions, lesson completions, and roadmap milestones.</span>
        </div>

        {/* 5-Level Intensity Legend */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] self-end sm:self-auto">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#151D20] border border-[#222E32]" title="0 contributions" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0E4429] border border-[#0E4429]" title="1-2 points" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#006D32] border border-[#006D32]" title="3-5 points" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#26A641] border border-[#26A641]" title="6-9 points" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#39D353] border-[#39D353]" title="10+ points" />
          <span>More</span>
        </div>
      </div>

      {/* Date Inspection Modal */}
      {activeDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#141A1C] border border-[#28383B] rounded-2xl p-6 shadow-2xl text-left space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
                  ACTIVITY AUDIT LOG
                </span>
                <h3 className="text-base font-bold text-white">
                  {formatTooltipDate(activeDayModal.date)}
                </h3>
              </div>
              <button
                onClick={() => setActiveDayModal(null)}
                className="p-1 rounded-lg hover:bg-[#1E282B] text-[#8A999E] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31] grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-[#78888D] block font-mono">SOLVED</span>
                <span className="text-sm font-bold text-white font-mono">{activeDayModal.problemsSolved}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#78888D] block font-mono">LESSONS</span>
                <span className="text-sm font-bold text-white font-mono">{activeDayModal.lessonsCompleted}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#78888D] block font-mono">TOTAL PTS</span>
                <span className="text-sm font-bold text-[#B5FF4A] font-mono">{activeDayModal.count}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#8A999E] uppercase tracking-wider block">
                Recorded Actions ({activeDayModal.events.length})
              </span>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeDayModal.events.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#0F1416] border border-[#222E31] text-center text-xs text-[#6E7F84]">
                    No recorded learning submissions on this calendar date.
                  </div>
                ) : (
                  activeDayModal.events.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      className="p-3 rounded-xl bg-[#0F1416] border border-[#222E31] flex items-start gap-2.5 text-xs"
                    >
                      <div className="p-1.5 rounded-lg bg-[#182326] border border-[#27373B] text-[#B5FF4A] shrink-0 mt-0.5">
                        {ev.type === 'problem_solved' ? <Code2 className="w-3.5 h-3.5 text-[#FFAD42]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#B5FF4A]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-white truncate">
                            {ev.problemTitle || ev.topicTitle || ev.lessonTitle || ev.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-[#B5FF4A] shrink-0 font-bold">
                            +{ev.points} pts
                          </span>
                        </div>
                        {ev.details && (
                          <p className="text-[11px] text-[#8A999E] mt-0.5 leading-snug">
                            {ev.details}
                          </p>
                        )}
                        <span className="text-[9px] text-[#6E7F84] font-mono block mt-1">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Verified
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDayModal(null)}
                className="px-4 py-1.5 rounded-xl bg-[#1C2528] hover:bg-[#253235] text-xs font-semibold text-white transition-colors"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

