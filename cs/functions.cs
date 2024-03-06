using System;

namespace ∞.DesignPatterns.AbstractFactory.Conceptual
{
    public interface IAbstractFactory
    {
        /// <summary> 
        /// creates a product A. 
        /// </summary> 
        IAbstractProductA CreateProductA();

        /// <summary> 
        /// creates a product B instance. 
        /// </summary> 
        IAbstractProductB CreateProductB();
    }

    class ConcreteFactory1 : IAbstractFactory
    {
        /// <summary> 
        /// creates a new instance of the `ConcreteProductA1` class, which is a concrete 
        /// implementation of the `IAbstractProductA` interface. 
        /// </summary> 
        /// <returns> 
        /// a new instance of `ConcreteProductA1`. 
        /// </returns> 
        public IAbstractProductA CreateProductA()
        {
            return new ConcreteProductA1();
        }

        /// <summary> 
        /// generates an instance of the `ConcreteProductB1` class, which is a derived class 
        /// of `AbstractProductB`. 
        /// </summary> 
        /// <returns> 
        /// a new instance of the `ConcreteProductB1` class. 
        /// </returns> 
        public IAbstractProductB CreateProductB()
        {
            return new ConcreteProductB1();
        }
    }

    class ConcreteFactory2 : IAbstractFactory
    {
        /// <summary> 
        /// creates a new instance of `ConcreteProductA2`. 
        /// </summary> 
        /// <returns> 
        /// a concrete instance of `ConcreteProductA2`. 
        /// </returns> 
        public IAbstractProductA CreateProductA()
        {
            return new ConcreteProductA2();
        }

        /// <summary> 
        /// creates a new instance of `ConcreteProductB2`. 
        /// </summary> 
        /// <returns> 
        /// a concrete implementation of `IAbstractProductB, specifically `ConcreteProductB2`. 
        /// </returns> 
        public IAbstractProductB CreateProductB()
        {
            return new ConcreteProductB2();
        }
    }

    public interface IAbstractProductA
    {
        string UsefulFunctionA();
    }

    class ConcreteProductA1 : IAbstractProductA
    {
        /// <summary> 
        /// generates a string result, "The result of the product A1.", based on input parameters. 
        /// </summary> 
        /// <returns> 
        /// a string representing the product of A1. 
        /// </returns> 
        public string UsefulFunctionA()
        {
            return "The result of the product A1.";
        }
    }

    class ConcreteProductA2 : IAbstractProductA
    {
        /// <summary> 
        /// returns a string representing the product of two unspecified values, `A1` and `A2`. 
        /// </summary> 
        /// <returns> 
        /// a string containing the value "The result of the product A2." 
        /// </returns> 
        public string UsefulFunctionA()
        {
            return "The result of the product A2.";
        }
    }

    public interface IAbstractProductB
    {
        string UsefulFunctionB();
        string AnotherUsefulFunctionB(IAbstractProductA collaborator);
    }

    class ConcreteProductB1 : IAbstractProductB
    {
        /// <summary> 
        ///  
        /// </summary> 
        /// <returns> 
        /// a string containing the value "The result of the product B1." 
        /// </returns> 
        public string UsefulFunctionB()
        {
            return "The result of the product B1.";
        }

        /// <summary> 
        /// takes an instance of `IAbstractProductA` and returns a string representation of 
        /// the result of collaborating with that object's `UsefulFunctionA()`. 
        /// </summary> 
        /// <param name="collaborator"> 
        /// productA object that is being used to generate the result, and it provides the 
        /// necessary context for the function to operate correctly. 
        /// </param> 
        /// <returns> 
        /// a string containing the name of the product and the result of the `UsefulFunctionA()` 
        /// method. 
        /// </returns> 
        public string AnotherUsefulFunctionB(IAbstractProductA collaborator)
        {
            var result = collaborator.UsefulFunctionA();

            return $"The result of the B1 collaborating with the ({result})";
        }
    }

    class ConcreteProductB2 : IAbstractProductB
    {
        /// <summary> 
        /// returns a string representing the result of multiplying two values, denoted by 'B'. 
        /// </summary> 
        /// <returns> 
        /// a string representing the result of the product of B2. 
        /// </returns> 
        public string UsefulFunctionB()
        {
            return "The result of the product B2.";
        }

        /// <summary> 
        /// takes an instance of `IAbstractProductA` and returns a string representing the 
        /// result of collaboration between the two objects. 
        /// </summary> 
        /// <param name="collaborator"> 
        /// type IAbstractProductA, which is used to return a result from the UsefulFunctionA 
        /// method called upon it. 
        /// </param> 
        /// <returns> 
        /// a string indicating the result of collaboration between an abstract product and 
        /// another collaborator. 
        /// </returns> 
        public string AnotherUsefulFunctionB(IAbstractProductA collaborator)
        {
            var result = collaborator.UsefulFunctionA();

            return $"The result of the B2 collaborating with the ({result})";
        }
    }

    class Client
    {
        /// <summary> 
        /// demonstrates how to use two different factory types to call a client method. 
        /// </summary> 
        public void Main()
        {
            Console.WriteLine("Client: Testing client code with the first factory type...");
            ClientMethod(new ConcreteFactory1());
            Console.WriteLine();

            Console.WriteLine("Client: Testing the same client code with the second factory type...");
            ClientMethod(new ConcreteFactory2());
        }

        /// <summary> 
        /// creates instances of `ProductA` and `ProductB`, and prints the results of two 
        /// methods on `ProductB`: `UsefulFunctionB()` and `AnotherUsefulFunctionB(ProductA)`. 
        /// </summary> 
        /// <param name="factory"> 
        /// Abstract Factory design pattern, which provides an interface for creating family 
        /// of related or dependent objects without specifying their concrete classes. 
        /// </param> 
        public void ClientMethod(IAbstractFactory factory)
        {
            var productA = factory.CreateProductA();
            var productB = factory.CreateProductB();

            Console.WriteLine(productB.UsefulFunctionB());
            Console.WriteLine(productB.AnotherUsefulFunctionB(productA));
        }
    }

    class Program
    {
        /// <summary> 
        /// runs the client's main execution flow. 
        /// </summary> 
        /// <param name="args"> 
        /// 1 or more command line arguments passed to the program when it is executed directly 
        /// from the console, and their values are available for use within the `Main()` method. 
        /// </param> 
        static void Main(string[] args)
        {
            new Client().Main();
        }
    }
}
