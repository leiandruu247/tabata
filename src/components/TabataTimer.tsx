import React, { useEffect, useState, useRef } from "react";
import { TabataItem, isCombo, Exercise } from "../types/tabata";
import styles from "./TabataBuilder.module.css";

type TimerStep = {
  label: string;
  duration: number;
  isRest: boolean;
  exerciseName: string;
};

function flattenTabata(
  items: TabataItem[],
  parentName = "",
  reps = 1
): TimerStep[] {
  let result: TimerStep[] = [];
  for (let item of items) {
    if (isCombo(item)) {
      for (let i = 0; i < item.repetitions * reps; i++) {
        result = result.concat(flattenTabata(item.children, item.name, 1));
      }
    } else {
      for (let i = 0; i < item.repetitions * reps; i++) {
        result.push({
          label: "Exercício",
          duration: item.duration,
          isRest: false,
          exerciseName: item.name,
        });
        if (item.rest > 0) {
          result.push({
            label: "Descanso",
            duration: item.rest,
            isRest: true,
            exerciseName: item.name,
          });
        }
      }
    }
  }
  return result;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m > 0 ? m + ":" : ""}${s.toString().padStart(2, "0")}`;
}

const TabataTimer: React.FC<{
  sequence: TabataItem[];
  onBack: () => void;
}> = ({ sequence, onBack }) => {
  const steps = flattenTabata(sequence);
  const [stepIdx, setStepIdx] = useState(0);
  const [seconds, setSeconds] = useState(steps[0]?.duration ?? 0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setStepIdx(0);
    setSeconds(steps[0]?.duration ?? 0);
  }, [sequence]);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = window.setTimeout(() => setSeconds(s => s - 1), 1000);
    }
    if (seconds === 0 && running) {
      if (stepIdx < steps.length - 1) {
        setStepIdx(i => i + 1);
        setSeconds(steps[stepIdx + 1]?.duration ?? 0);
      } else {
        setRunning(false);
      }
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [seconds, running, stepIdx, steps]);

  function handleStart() {
    setRunning(true);
  }
  function handlePause() {
    setRunning(false);
  }
  function handleReset() {
    setRunning(false);
    setStepIdx(0);
    setSeconds(steps[0]?.duration ?? 0);
  }
  function handleBack() {
    setRunning(false);
    onBack();
  }

  if (steps.length === 0) {
    return (
      <div className={styles.timerContainer}>
        <h2>Tabata Timer</h2>
        <p>Nenhum exercício configurado!</p>
        <button onClick={handleBack}>Voltar</button>
      </div>
    );
  }

  const current = steps[stepIdx];
  const finished = stepIdx === steps.length - 1 && seconds === 0;

  return (
    <div className={styles.timerContainer}>
      <h2>Tabata Timer</h2>
      {!finished ? (
        <>
          <div className={styles.timerDisplay}>
            {formatTime(seconds)}
          </div>
          <div className={styles.timerTitle}>
            {current.isRest ? "Descanso" : "Exercício"}: <b>{current.exerciseName}</b>
          </div>
          <div className={styles.timerButtons}>
            {!running ? (
              <button className="active" onClick={handleStart}>Iniciar</button>
            ) : (
              <button className="active" onClick={handlePause}>Pausar</button>
            )}
            <button onClick={handleReset}>Reiniciar</button>
            <button onClick={handleBack}>Voltar</button>
          </div>
          <div style={{ marginTop: 18, fontSize: "1.05em", color: "#233263" }}>
            Etapa {stepIdx + 1} de {steps.length}
          </div>
        </>
      ) : (
        <>
          <div className={styles.timerDisplay}>Fim!</div>
          <div style={{ marginBottom: 16, color: "#15bb5b", fontWeight: 600, fontSize: "1.15em" }}>
            Parabéns, Tabata concluído!
          </div>
          <button className="active" onClick={handleBack}>Voltar ao Builder</button>
        </>
      )}
    </div>
  );
};

export default TabataTimer;
