using System;

namespace ∞.DesignPatterns.AbstractFactory.Conceptual
{
    public interface IAbstractFactory
    {
        IAbstractProductA CreateProductA();

        IAbstractProductB CreateProductB();
    }

    class ConcreteFactory1 : IAbstractFactory
    {
        public IAbstractProductA CreateProductA()
        {
            return new ConcreteProductA1();
        }

        public IAbstractProductB CreateProductB()
        {
            return new ConcreteProductB1();
        }
    }

    class ConcreteFactory2 : IAbstractFactory
    {
        public IAbstractProductA CreateProductA()
        {
            return new ConcreteProductA2();
        }

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
        public string UsefulFunctionA()
        {
            return "The result of the product A1.";
        }
    }

    class ConcreteProductA2 : IAbstractProductA
    {
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
        public string UsefulFunctionB()
        {
            return "The result of the product B1.";
        }

        /// <summary> 
        /// takes an `IAbstractProductA` parameter and returns a string representation of the 
        /// result of collaborating with that product using `UsefulFunctionA`. 
        /// </summary> 
        /// <param name="collaborator"> 
        /// abstract product A, which is used to perform a useful function A and provide the 
        /// result for the calculation of the output string. 
        /// </param> 
        /// <returns> 
        /// a string indicating the result of collaboration between an abstract product and 
        /// its collaborator. 
        /// </returns> 
        public string AnotherUsefulFunctionB(IAbstractProductA collaborator)
        {
            var result = collaborator.UsefulFunctionA();

            return $"The result of the B1 collaborating with the ({result})";
        }
    }

    class ConcreteProductB2 : IAbstractProductB
    {
        public string UsefulFunctionB()
        {
            return "The result of the product B2.";
        }

        /// <summary> 
        /// takes an instance of `IAbstractProductA`, calls its `UsefulFunctionA` method, and 
        /// returns a string representation of the result, including the type of the original 
        /// input. 
        /// </summary> 
        /// <param name="collaborator"> 
        /// abstract product 'A' that is used by the function 'UsefulFunctionA' to generate 
        /// the result of the collaboration between 'B' and 'A'. 
        /// </param> 
        /// <returns> 
        /// a string that includes the result of the `UsefulFunctionA` function and the type 
        /// of the result. 
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
        /// demonstrates how to use two different factory types to call a client method, 
        /// printing messages after each call to indicate which factory type was used. 
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
        /// calls 
        /// two factory methods to create objects `ProductA` and `ProductB`, then calls a 
        /// method on `ProductB` that takes an instance of `ProductA` as input, and another 
        /// method on `ProductB` that takes both instances as input. 
        /// </summary> 
        /// <param name="factory"> 
        /// abstract factory that is used to create instances of products A and B. 
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
        static void Main(string[] args)
        {
            new Client().Main();
        }
    }
}
