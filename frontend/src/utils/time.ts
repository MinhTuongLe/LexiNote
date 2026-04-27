/**
 * Formats minutes into a readable time string (e.g. 125 -> "2h 5m", 45 -> "45m")
 */
export const formatTimeSpent = (totalMinutes: number): { value: number; unit: string; label: string; decimals: number } => {
  if (totalMinutes < 60) {
    return {
      value: totalMinutes,
      unit: 'm',
      label: `${totalMinutes}m`,
      decimals: 0
    };
  }
  
  const hours = totalMinutes / 60;
  if (totalMinutes % 60 === 0) {
    return {
      value: hours,
      unit: 'h',
      label: `${hours}h`,
      decimals: 0
    };
  }
  
  return {
    value: Math.round(hours * 10) / 10,
    unit: 'h',
    label: `${(Math.round(hours * 10) / 10)}h`,
    decimals: 1
  };
};
