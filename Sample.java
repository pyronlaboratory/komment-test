import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Predicate;

public class LambdaDemo {

    /**
     * Main calls Runnable and Binary Operation run methods; it applies predicates to the
     * list of strings for stream(); it invokes the forEach() on lists using consumer and
     * prints to Upper Case or System.out .println(all strings).
     * 
     * @param args The `args` input parameter is not used within the provided code fragment.
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
