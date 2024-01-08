import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

class Services {
    private final BlockingQueue<Runnable> queue;
    public Services(int capacity) {
        this.queue = new LinkedBlockingQueue<>(capacity);
    }
    public void submitTask(Runnable task) {
        try {
            queue.put(task);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    public void processTasks() {
        while (true) {
            try {
                Runnable task = queue.poll(1, TimeUnit.SECONDS);
                if (task != null) {
                    task.run();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Services service = new TaskQueue(10);
        service.submitTask(() -> System.out.println("Task 1"));
        service.submitTask(() -> System.out.println("Task 2"));
        service.submitTask(() -> System.out.println("Task 3"));
        Thread taskProcessorThread = new Thread(() -> service.processTasks());
        taskProcessorThread.start();
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        taskProcessorThread.interrupt();
    }
}
