#region Copyright & License Information
/*
 * Copyright (c) The OpenRA Developers and Contributors
 * This file is part of OpenRA, which is free software. It is made
 * available to you under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version. For more
 * information, see COPYING.
 */
#endregion

using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using OpenRA.Primitives;
using OpenRA.Traits;

namespace OpenRA
{
	[AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
	public sealed class SyncAttribute : Attribute { }

	// Marker interface
	public interface ISync { }

	public static class Sync
	{
		static readonly ConcurrentCache<Type, Func<object, int>> HashFunctions =
			new(GenerateHashFunc);

		internal static Func<object, int> GetHashFunction(ISync sync)
		{
			return HashFunctions[sync.GetType()];
		}


		internal static int Hash(ISync sync)
		{
			return GetHashFunction(sync)(sync);
		}

		static readonly Dictionary<Type, MethodInfo> CustomHashFunctions = new()
		{
			{ typeof(int2), ((Func<int2, int>)HashInt2).Method },
			{ typeof(CPos), ((Func<CPos, int>)HashCPos).Method },
			{ typeof(CVec), ((Func<CVec, int>)HashCVec).Method },
			{ typeof(WDist), ((Func<WDist, int>)HashUsingHashCode).Method },
			{ typeof(WPos), ((Func<WPos, int>)HashUsingHashCode).Method },
			{ typeof(WVec), ((Func<WVec, int>)HashUsingHashCode).Method },
			{ typeof(WAngle), ((Func<WAngle, int>)HashUsingHashCode).Method },
			{ typeof(WRot), ((Func<WRot, int>)HashUsingHashCode).Method },
			{ typeof(Actor), ((Func<Actor, int>)HashActor).Method },
			{ typeof(Player), ((Func<Player, int>)HashPlayer).Method },
			{ typeof(Target), ((Func<Target, int>)HashTarget).Method },
		};

		static void EmitSyncOpcodes(Type type, ILGenerator il)
		{
			if (CustomHashFunctions.TryGetValue(type, out var hashFunction))
				il.EmitCall(OpCodes.Call, hashFunction, null);
			else if (type == typeof(bool))
			{
				var l = il.DefineLabel();
				il.Emit(OpCodes.Ldc_I4, 0xaaa);
				il.Emit(OpCodes.Brtrue, l);
				il.Emit(OpCodes.Pop);
				il.Emit(OpCodes.Ldc_I4, 0x555);
				il.MarkLabel(l);
			}
			else if (type != typeof(int))
				throw new NotImplementedException($"SyncAttribute on member of unhashable type: {type.FullName}");

			il.Emit(OpCodes.Xor);
		}

		static Func<object, int> GenerateHashFunc(Type t)
		{
			var d = new DynamicMethod($"hash_{t.Name}", typeof(int), new Type[] { typeof(object) }, t);
			var il = d.GetILGenerator();
			var this_ = il.DeclareLocal(t).LocalIndex;
			il.Emit(OpCodes.Ldarg_0);
			il.Emit(OpCodes.Castclass, t);
			il.Emit(OpCodes.Stloc, this_);
			il.Emit(OpCodes.Ldc_I4_0);

			const BindingFlags Binding = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance;
			foreach (var field in t.GetFields(Binding).Where(x => x.HasAttribute<SyncAttribute>()))
			{
				il.Emit(OpCodes.Ldloc, this_);
				il.Emit(OpCodes.Ldfld, field);

				EmitSyncOpcodes(field.FieldType, il);
			}

			foreach (var prop in t.GetProperties(Binding).Where(x => x.HasAttribute<SyncAttribute>()))
			{
				il.Emit(OpCodes.Ldloc, this_);
				il.EmitCall(OpCodes.Call, prop.GetGetMethod(true), null);

				EmitSyncOpcodes(prop.PropertyType, il);
			}

			il.Emit(OpCodes.Ret);
			return (Func<object, int>)d.CreateDelegate(typeof(Func<object, int>));
		}

		/// <summary> 
		/// <c>HashInt2</c> calculates an integer hash value based on the x and y coordinates 
		/// of a `int2` structure, returning the result in a specific format. 
		/// </summary> 
		/// <param name="i2"> 
		/// 2D coordinate of an integer point, with `X` and `Y` components that are multiplied 
		/// by constants, then squared, and finally divided by 4 to produce the final output 
		/// value. 
		/// </param> 
		/// <returns> 
		/// a 32-bit integer value computed from the x and y coordinates of an `int2` object 
		/// using a cryptographic hash function. 
		/// </returns> 
		public static int HashInt2(int2 i2)
		{
			return ((i2.X * 5) ^ (i2.Y * 3)) / 4;
		}

		/// <summary> 
		/// <c>HashCPos</c> computes and returns the bits of a CPos object, which represents 
		/// an offset in a computer file system. 
		/// </summary> 
		/// <param name="i2"> 
		/// 32-bit integer value to be hashed. 
		/// </param> 
		/// <returns> 
		/// the value of the `Bits` field of the input `CPos` object. 
		/// </returns> 
		public static int HashCPos(CPos i2)
		{
			return i2.Bits;
		}

		/// <summary> 
		/// <c>HashCVec</c> computes a hash value for a given vector `i2`. It does so by 
		/// multiplying `X` and `Y` components, squaring the result, then taking the bitwise 
		/// XOR, dividing by 4, and returning the result as an integer. 
		/// </summary> 
		/// <param name="i2"> 
		/// 2D vector to be transformed, and it is used to calculate the resultant hash value 
		/// through a multiplication, exponentiation, and division operation. 
		/// </param> 
		/// <returns> 
		/// an integer value between 0 and 1, inclusive. 
		/// </returns> 
		public static int HashCVec(CVec i2)
		{
			return ((i2.X * 5) ^ (i2.Y * 3)) / 4;
		}

		/// <summary> 
		/// <c>HashActor</c> computes an integer hash value for an actor object by bitshifting 
		/// its `ActorID` by 16 positions to the left and returning the result as an integer. 
		/// </summary> 
		/// <param name="a"> 
		/// Actor object whose ID will be hashed and returned as an integer value. 
		/// </param> 
		/// <returns> 
		/// an integer value representing a hash code for the input `Actor` object. 
		/// </returns> 
		public static int HashActor(Actor a)
		{
			if (a != null)
				return (int)(a.ActorID << 16);
			return 0;
		}

		/// <summary> 
		/// <c>HashPlayer</c> computes a unique integer value for a `Player` object based on 
		/// its `ActorID`. 
		/// </summary> 
		/// <param name="p"> 
		/// Player object to be processed, which is used to calculate its hash value through 
		/// a mathematical operation involving the Actor ID and a constant value. 
		/// </param> 
		/// <returns> 
		/// a 32-bit integer value based on the Actor ID of the player. 
		/// </returns> 
		public static int HashPlayer(Player p)
		{
			if (p != null)
				return (int)(p.PlayerActor.ActorID << 16) * 0x567;
			return 0;
		}

		/// <summary> 
		/// <c>HashTarget</c> calculates a hash code for a target based on its type and sub-type, 
		/// using a custom formula that combines the high and low order bytes of the target's 
		/// identifier. 
		/// </summary> 
		/// <param name="t"> 
		/// Target object, which determines the specific type of hash calculation to perform 
		/// based on its Type property. 
		/// </param> 
		/// <returns> 
		/// a hash value for the given target, calculated using a custom algorithm. 
		/// </returns> 
		public static int HashTarget(Target t)
		{
			switch (t.Type)
			{
				case TargetType.Actor:
					return (int)(t.Actor.ActorID << 16) * 0x567;

				case TargetType.FrozenActor:
					var actor = t.FrozenActor.Actor;
					if (actor == null)
						return 0;

					return (int)(actor.ActorID << 16) * 0x567;

				case TargetType.Terrain:
					return HashUsingHashCode(t.CenterPosition);

				case TargetType.Invalid:
				default:
					return 0;
			}
		}

		public static int HashUsingHashCode<T>(T t)
		{
			return t.GetHashCode();
		}

		/// <summary> 
		/// <c>RunUnsynced</c> executes a provided action `fn` without synchronizing with other 
		/// threads or processes, returning `true` after completion. 
		/// </summary> 
		/// <param name="world"> 
		/// 2D game world in which the specified action or code will be executed. 
		/// </param> 
		/// <param name="fn"> 
		/// action to be executed without synchronization, which is passed as a delegate to 
		/// the `RunUnsynced` method for execution. 
		/// </param> 
		public static void RunUnsynced(World world, Action fn)
		{
			RunUnsynced(Game.Settings.Debug.SyncCheckUnsyncedCode, world, () => { fn(); return true; });
		}

		/// <summary> 
		/// <c>RunUnsynced</c> performs an action `fn` passed as a lambda expression and returns 
		/// `true`. 
		/// </summary> 
		/// <param name="checkSyncHash"> 
		/// 32-byte hash value of the client's current state, which is used to determine whether 
		/// the client needs to sync its state with the server. 
		/// </param> 
		/// <param name="world"> 
		/// 3D game world where the code is executed, and it is used to determine the context 
		/// in which the `fn` action is performed. 
		/// </param> 
		/// <param name="fn"> 
		/// action to be executed asynchronously. 
		/// </param> 
		public static void RunUnsynced(bool checkSyncHash, World world, Action fn)
		{
			RunUnsynced(checkSyncHash, world, () => { fn(); return true; });
		}

		static int unsyncCount = 0;

		public static T RunUnsynced<T>(World world, Func<T> fn)
		{
			return RunUnsynced(Game.Settings.Debug.SyncCheckUnsyncedCode, world, fn);
		}

		public static T RunUnsynced<T>(bool checkSyncHash, World world, Func<T> fn)
		{
			unsyncCount++;

			// Detect sync changes in top level entry point only. Do not recalculate sync hash during reentry.
			var sync = unsyncCount == 1 && checkSyncHash && world != null ? world.SyncHash() : 0;

			// Running this inside a try with a finally statement means unsyncCount is decremented as soon as fn completes
			try
			{
				return fn();
			}
			finally
			{
				unsyncCount--;

				// When the world is disposing all actors and effects have been removed
				// So do not check the hash for a disposing world since it definitively has changed
				if (unsyncCount == 0 && checkSyncHash && world != null && !world.Disposing && sync != world.SyncHash())
					throw new InvalidOperationException("RunUnsynced: sync-changing code may not run here");
			}
		}

		/// <summary> 
		/// <c>AssertUnsynced</c> verifies that a certain counter is at zero before raising 
		/// an exception with a provided message if it's not. 
		/// </summary> 
		/// <param name="message"> 
		/// message to be thrown as an `InvalidOperationException` if the `unsyncCount` variable 
		/// is equal to zero. 
		/// </param> 
		public static void AssertUnsynced(string message)
		{
			if (unsyncCount == 0)
				throw new InvalidOperationException(message);
		}
	}
}
