package com.thealgorithms.scheduling;
import com.thealgorithms.devutils.entities.ProcessDetails;
import java.util.List;

public class FCFSScheduling {

    private List<ProcessDetails> processes;

    FCFSScheduling(final List<ProcessDetails> processes) {
        this.processes = processes;
    }

    /**
     * This function evaluates two timings related to process scheduling: waiting time
     * and turnaround time.
     */
    public void scheduleProcesses() {
        evaluateWaitingTime();
        evaluateTurnAroundTime();
    }

    /**
     * This function calculates the waiting time for each process inside a vector of
     * processes and assigns it to the respective process.
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
     * This function evaluates the turnaround time for each process (i.e., the total time
     * taken to complete a process including its waiting and burst times) by setting the
     * turnaround time of each process to the sum of its burst time and waiting time.
     */
    private void evaluateTurnAroundTime() {
        for (int i = 0; i < processes.size(); i++) {
            processes.get(i).setTurnAroundTimeTime(processes.get(i).getBurstTime() + processes.get(i).getWaitingTime());
        }
    }
}
