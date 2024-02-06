import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Predicate;

public class LambdaDemo {

    /**
     * Executes the Runnable and BinaryOperation. Using forEach with predicate returns a
     * Stream object starting with A. The use of forEach without parameter performs action
     * on elements (converts to upper case).
     * 
     * @param args The `args` parameter is passed to the `main` method and represents an
     * array of command line arguments given when invoking the application from the command
     * line. These are ignored as the code doesn't use them at all.
     */
    public static void main(String[] args) {
        Runnable hello = () -> System.out.println("Hello, Lambda!");
        hello.run();

        BinaryOperation add = (a, b) -> a + b;
        System.out.println("Addition result: " + add.calculate(5, 3));

        List<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");

        names.forEach(name -> System.out.println("Name: " + name));

        Predicate<String> startsWithA = s -> s.startsWith("A");
        System.out.println("Names starting with 'A':");
        names.stream().filter(startsWithA).forEach(System.out::println);

        Consumer<String> printUpperCase = s -> System.out.println(s.toUpperCase());
        System.out.println("Names in uppercase:");
        names.forEach(printUpperCase);
    }

    interface BinaryOperation {
        int calculate(int a, int b);
    }
}
