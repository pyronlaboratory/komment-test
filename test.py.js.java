package com.thealgorithms.scheduling;
import com.thealgorithms.devutils.entities.ProcessDetails;
import java.util.List;

public class FCFSScheduling {

    private List<ProcessDetails> processes;

    FCFSScheduling(final List<ProcessDetails> processes) {
        this.processes = processes;
    }
    /**
     * This function evaluates two time intervals: "waiting time" and "turn-around time"
     */
    public void scheduleProcesses() {
        evaluateWaitingTime();
        evaluateTurnAroundTime();
    }

    /**
     * This function calculates the waiting time for each process (excluding the first
     * one) by adding the burst time of the previous process to its waiting time. It sets
     * the waiting time for the first process to 0 and uses a loop to iterate over the
     * remaining processes.
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
     * This function evaluates the turnaround time for each process by adding the burst
     * time and waiting time of each process.
     */
    private void evaluateTurnAroundTime() {
        for (int i = 0; i < processes.size(); i++) {
            processes.get(i).setTurnAroundTimeTime(processes.get(i).getBurstTime() + processes.get(i).getWaitingTime());
        }
    }
}
