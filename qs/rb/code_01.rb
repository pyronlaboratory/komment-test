#!/usr/bin/ruby
# Protocol Buffers - Google's data interchange format
# Copyright 2008 Google Inc.  All rights reserved.
#
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

require 'google/protobuf/any_pb'
require 'google/protobuf/duration_pb'
require 'google/protobuf/field_mask_pb'
require 'google/protobuf/struct_pb'
require 'google/protobuf/timestamp_pb'

module Google
  module Protobuf

    Any.class_eval do
      def self.pack(msg, type_url_prefix='type.googleapis.com/')
        any = self.new
        any.pack(msg, type_url_prefix)
        any
      end

      # takes a message object `msg` and a type URL prefix `type_url_prefix`, and generates
      # a type URL for the message based on its class name. The resulting type URL is
      # stored in the function's instance variable, `self.type_url`.
      # 
      # @param msg [` :: ProtocolMessage`.] message that will be packed into a protobuf
      # format, and it is used to set the `type_url` property of the current instance.
      # 
      # 		- `msg.class.descriptor`: The descriptor for the message class that `msg` belongs
      # to.
      # 		- `msg.to_proto`: The raw bytes representation of the message.
      # 
      # 
      # @param type_url_prefix [String] URL prefix for the message's type descriptor, which
      # is used to construct the final `type_url` variable containing the full URL of the
      # message's type descriptor.
      # 
      # @returns [String] a URL for the serialized message based on the given type URL prefix.
      def pack(msg, type_url_prefix='type.googleapis.com/')
        if type_url_prefix.empty? or type_url_prefix[-1] != '/' then
          self.type_url = "#{type_url_prefix}/#{msg.class.descriptor.name}"
        else
          self.type_url = "#{type_url_prefix}#{msg.class.descriptor.name}"
        end
        self.value = msg.to_proto
      end

      # decodes a value stored in an object instance of a subclass of `AbstractObject`,
      # based on the type of the object instance.
      # 
      # @param klass [Object] class of the object being decoded, and is used to determine
      # if the object can be decoded and returned as its original class type.
      # 
      # @returns [`nil`.] a decoded value of the given class type if it is an instance of
      # that class, otherwise `nil`.
      # 
      # 		- If `self.is(klass)` is `true`, then the `klass.decode(self.value)` method is
      # called to decode the value of the object.
      # 		- Otherwise, the output is `nil`.
      def unpack(klass)
        if self.is(klass) then
          klass.decode(self.value)
        else
          nil
        end
      end

      # Returns the last component of a URL
      # Split by `/`
      # 
      # @returns [instance of the last element of the URL segment split by `/`.] the last
      # component of a URL path segment.
      # 
      # 		- `self.type_url`: This is the URL path of the type, which is used to determine
      # the final name of the type after splitting it into components.
      # 		- `-1`: The last element of the split array is the final type name.
      def type_name
        return self.type_url.split("/")[-1]
      end

      # determines if an object's type matches a specific class.
      # 
      # @param klass [Object] class that the method belongs to and is used to determine
      # if the method's type name matches the class's descriptor name.
      # 
      # @returns [Object] a boolean value indicating whether the receiver and the passed
      # klass are of the same type.
      def is(klass)
        return self.type_name == klass.descriptor.name
      end
    end

    Timestamp.class_eval do
      # takes a hash with seconds, nanos, and an optional `:nanosecond` key and returns a
      # Time object representing the specified time duration in seconds, nanoseconds, and
      # optional `:nanosecond` precision.
      # 
      # @returns [Object] a `Time` object representing the specified seconds and nanoseconds
      # since the Unix epoch.
      def to_time
        Time.at(seconds, nanos, :nanosecond)
      end

      def self.from_time(time)
        new.from_time(time)
      end

      # transforms a `Time` object into an instance of the `Time` class, setting its
      # `seconds` and `nanos` attributes to the corresponding values of the input `Time`
      # object.
      # 
      # @param time [`Numeric`.] datetime object that contains the seconds and nanoseconds
      # values, which are then assigned to instance variables `self.seconds` and `self.nanos`
      # in the function `from_time`.
      # 
      # 		- `to_i`: Returns the integer part of `time`.
      # 		- `nsec`: Returns the nanosecond part of `time`.
      # 
      # 
      # @returns [Time] an instance of the `Time` class with the provided time value in
      # seconds and nanoseconds.
      def from_time(time)
        self.seconds = time.to_i
        self.nanos = time.nsec
        self
      end

      # converts the instance variable `self.seconds` into an integer value.
      # 
      # @returns [Integer] an integer representing the seconds of the given Time object.
      def to_i
        self.seconds
      end

      # calculates a floating-point number equivalent to its argument, considering both
      # seconds and nanoseconds parts.
      # 
      # @returns [Float] a floating-point number representing the duration of the object
      # in seconds, rounded to the nearest integer.
      def to_f
        self.seconds + (self.nanos.quo(1_000_000_000))
      end
    end

    Duration.class_eval do
      # multiplies the instance's `seconds` field by 1,000,000,000 and adds the result to
      # its `nanos` field, converting it to a floating-point number.
      # 
      # @returns [Float] a floating-point number representing the duration in seconds and
      # nanoseconds.
      def to_f
        self.seconds + (self.nanos.to_f / 1_000_000_000)
      end
    end

    class UnexpectedStructType < Google::Protobuf::Error; end

    Value.class_eval do
      # converts a struct value into a Ruby hash or list, depending on the value's type.
      # It also handles null, number, string, and boolean values correctly.
      # 
      # @param recursive [boolean value.] continuation of recursion in the to_h or to_a
      # conversion of struct and list values, respectively.
      # 
      # 		- `recursive`: This parameter indicates whether to recursively deserialize nested
      # struct values or not. If set to `true`, nested struct values will be deserialized
      # as well. Otherwise, only the top-level struct value will be deserialized.
      # 
      # 
      # @returns [String] a ruby hash or array, depending on the value of the `recursive`
      # parameter.
      def to_ruby(recursive = false)
        case self.kind
        when :struct_value
          if recursive
            self.struct_value.to_h
          else
            self.struct_value
          end
        when :list_value
          if recursive
            self.list_value.to_a
          else
            self.list_value
          end
        when :null_value
          nil
        when :number_value
          self.number_value
        when :string_value
          self.string_value
        when :bool_value
          self.bool_value
        else
          raise UnexpectedStructType
        end
      end

      def self.from_ruby(value)
        self.new.from_ruby(value)
      end

      # takes a Ruby value as input and returns a Python object of the same type, handling
      # various types including classes, nils, numbers, strings, booleans, structs, hashes,
      # lists, and arrays.
      # 
      # @param value [Object] object being converted to the target struct type, and its
      # value is used to determine the appropriate field of the target struct to assign
      # or raise an exception if the input cannot be converted.
      # 
      # @returns [Class] a Ruby object that represents the given value.
      def from_ruby(value)
        case value
        when NilClass
          self.null_value = :NULL_VALUE
        when Numeric
          self.number_value = value
        when String
          self.string_value = value
        when TrueClass
          self.bool_value = true
        when FalseClass
          self.bool_value = false
        when Struct
          self.struct_value = value
        when Hash
          self.struct_value = Struct.from_hash(value)
        when ListValue
          self.list_value = value
        when Array
          self.list_value = ListValue.from_a(value)
        else
          raise UnexpectedStructType
        end

        self
      end
    end

    Struct.class_eval do
      def [](key)
        self.fields[key].to_ruby
      rescue NoMethodError
        nil
      end

      def []=(key, value)
        unless key.is_a?(String)
          raise UnexpectedStructType, "Struct keys must be strings."
        end
        self.fields[key] ||= Google::Protobuf::Value.new
        self.fields[key].from_ruby(value)
      end

      # converts the instance variables of a class to a Hash object, using the `to_ruby`
      # method on each variable and passing `true` as the second argument to indicate that
      # the conversion should be done for an external representation.
      # 
      # @returns [Hash] a hash containing the method's parameters in their Ruby form.
      def to_h
        ret = {}
        self.fields.each { |key, val| ret[key] = val.to_ruby(true) }
        ret
      end

      def self.from_hash(hash)
        ret = Struct.new
        hash.each { |key, val| ret[key] = val }
        ret
      end

      # checks if a given key is present in the object's fields.
      # 
      # @param key [String] key that is being searched for in the `self.fields` dictionary.
      # 
      # @returns [`boolean`.] a boolean value indicating whether a given key is present
      # in the object's fields.
      # 
      # 		- The function returns a boolean value indicating whether a given key exists in
      # the self.fields dictionary.
      # 		- If the key is present in the dictionary, the function returns `true`.
      # 		- If the key is not present in the dictionary, the function returns `false`.
      # 
      # 	The function does not modify the contents of the `self.fields` dictionary.
      def has_key?(key)
        self.fields.has_key?(key)
      end
    end

    ListValue.class_eval do
      include Enumerable

      # returns the number of elements in an object's `values` attribute.
      # 
      # @returns [`Int32`.] the number of elements in the object's values list.
      # 
      # 	The `length` function returns the number of values in the self.values property.
      def length
        self.values.length
      end

      def [](index)
        self.values[index].to_ruby
      end

      def []=(index, value)
        self.values[index].from_ruby(value)
      end

      def <<(value)
        wrapper = Google::Protobuf::Value.new
        wrapper.from_ruby(value)
        self.values << wrapper
      end

      # in Ruby recursively applies a block of code to each element in an array or collection,
      # passing the element's value as an argument to the block in Ruby syntax.
      # 
      # @returns [instance of `Yield`.] a sequence of individual Ruby objects, each
      # representing a value from the original array.
      # 
      # 		- `self.values.each { |x| yield(x.to_ruby) }`: The `each` function takes an block
      # of code that is executed for each element in the `values` collection of the object.
      # The block is passed a reference to the current element as an argument, which can
      # be accessed using the variable `x`.
      # 		- `yield(x.to_ruby)`: The `yield` method allows you to pass control back to the
      # caller of the `each` function, allowing you to perform further actions on the
      # element that was just processed. The `x.to_ruby` expression converts the current
      # element to a ruby object, which can be used in the block.
      def each
        self.values.each { |x| yield(x.to_ruby) }
      end

      # maps each element of an instance of `self` (i.e., the object being passed to the
      # function) over to a ruby array using the `to_ruby` method with the optional argument
      # `true`.
      # 
      # @returns [Array] a list of Ruby objects representing the values in the original
      # code object's `values` array, each wrapped in an instance of `Array`.
      def to_a
        self.values.map { |x| x.to_ruby(true) }
      end

      def self.from_a(arr)
        ret = ListValue.new
        arr.each { |val| ret << val }
        ret
      end
    end
  end
end
