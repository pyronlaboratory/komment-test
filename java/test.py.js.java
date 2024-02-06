package com.thealgorithms.scheduling;
import com.thealgorithms.devutils.entities.ProcessDetails;
import java.util.List;

public class FCFSScheduling {

    private List<ProcessDetails> processes;

    FCFSScheduling(final List<ProcessDetails> processes) {
        this.processes = processes;
    }
    /**
     * This function evaluates two timers (waiting time and turnaround time) to possibly
     * schedule processes.
     */
    public void scheduleProcesses() {
        evaluateWaitingTime();
        evaluateTurnAroundTime();
    }

    /**
     * This function evaluates the waiting time for each process of a given list of
     * processes (stored by 'processes'), and sets the waiting time for each process accordingly.
     */
    private void evaluateWaitingTime() {
        int processesNumber = processes.size();

        if (processesNumber == 0) {
            return;
        }

        int waitingTime = 0;
        int burstTime = processes.get(0).getBurstTime();

        processes.get(0).setWaitingTime(waitingTime); // for the first process, waiting time will be 0.

        for (int i = 1; i < processesNumber; i++) {
            processes.get(i).setWaitingTime(waitingTime + burstTime);
            waitingTime = processes.get(i).getWaitingTime();
            burstTime = processes.get(i).getBurstTime();
        }
    }

    /**
     * This function updates the turnaround time of each process (i.e., the total time
     * spent by a process on its CPU bursts and waiting) using the burst time and waiting
     * time of each process.
     */
    private void evaluateTurnAroundTime() {
        for (int i = 0; i < processes.size(); i++) {
            processes.get(i).setTurnAroundTimeTime(processes.get(i).getBurstTime() + processes.get(i).getWaitingTime());
        }
    }
}
