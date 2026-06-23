import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('da-DK', {
          timeZone: 'Europe/Copenhagen',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('da-DK', {
          timeZone: 'Europe/Copenhagen',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full flex flex-col justify-between">
      <p className="text-xs uppercase tracking-widest" style={{color:'#9a8e82'}}>Lokal tid</p>
      <div>
        <p className="text-4xl font-light tabular-nums leading-none" style={{color:'#1c1814'}}>
          {time || '--:--:--'}
        </p>
        <p className="text-sm mt-1 capitalize" style={{color:'#7a6e62'}}>{date}</p>
      </div>
      <p className="text-xs" style={{color:'#b0a498'}}>København · CET</p>
    </div>
  );
}
