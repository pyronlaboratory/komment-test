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

      # generates high-quality documentation for code given to it by determining and setting
      # the type URL for a message based on a prefix string.
      # 
      # @param msg [Object] message to be packed with its class descriptor name.
      # 
      # @param type_url_prefix [String] prefix to be appended to the message's class
      # descriptor name to form the complete type URL.
      # 
      # @returns [String] a URL for the serialized message.
      def pack(msg, type_url_prefix='type.googleapis.com/')
        if type_url_prefix.empty? or type_url_prefix[-1] != '/' then
          self.type_url = "#{type_url_prefix}/#{msg.class.descriptor.name}"
        else
          self.type_url = "#{type_url_prefix}#{msg.class.descriptor.name}"
        end
        self.value = msg.to_proto
      end

      # decodes a value of a given class type by calling the `decode` method on the
      # corresponding subclass instance.
      # 
      # @param klass [Object] class of the object that the `unpack` method is being called
      # on, and it is used to determine whether the method can decode the value of the
      # object or not.
      # 
      # @returns [`nil` value.] a decoded value of the given class type if it is an instance
      # of that class, otherwise `nil`.
      # 
      # 		- The function takes a `klass` argument, which is an instance of a class that
      # has a `decode` method.
      # 		- If the input to the function is an instance of the passed `klass`, the `decode`
      # method of the class is called with the input's `value` as its argument.
      # 		- If the input is not an instance of the passed `klass`, the function returns `nil`.
      def unpack(klass)
        if self.is(klass) then
          klass.decode(self.value)
        else
          nil
        end
      end

      # returns the last element of a provided URL's path segment list, which is used to
      # identify the type of an object.
      # 
      # @returns [String] the last component of a URL path segment.
      def type_name
        return self.type_url.split("/")[-1]
      end

      # checks if the class of an instance object is equal to a given class name.
      # 
      # @param klass [Object] Class object whose descriptor's name is being compared to
      # the current instance's `type_name`, determining if they are the same.
      # 
      # @returns [Object] a boolean value indicating whether the object's type name matches
      # the given class name.
      def is(klass)
        return self.type_name == klass.descriptor.name
      end
    end

    Timestamp.class_eval do
      # converts a seconds, nanos argument into a Time object.
      # 
      # @returns [Object] a `Time` object representing the specified number of seconds and
      # nanoseconds since the Unix epoch.
      def to_time
        Time.at(seconds, nanos, :nanosecond)
      end

      def self.from_time(time)
        new.from_time(time)
      end

      # takes a `Time` object as input and updates the instance variables `seconds` and
      # `nanos` with the time's value.
      # 
      # @param time [`Numeric`.] timestamp in seconds and nanoseconds that is being converted
      # to a Time struct object.
      # 
      # 		- `to_i`: This method converts the `Time` object to an integer value representing
      # the number of seconds since the epoch (January 1, 1970, at 00:00:00 UTC).
      # 		- `nsec`: This attribute represents the fractional part of a second as a positive
      # double-precision floating-point number, representing nanoseconds.
      # 
      # 
      # @returns [Class] a new instance of the `Time` class with the given seconds and nanoseconds.
      def from_time(time)
        self.seconds = time.to_i
        self.nanos = time.nsec
        self
      end

      # converts the object's seconds attribute into an integer value.
      # 
      # @returns [Integer] an integer representing the number of seconds in the given
      # object's time value.
      def to_i
        self.seconds
      end

      # calculates the float value of a `Time` object by adding its `seconds` and fractional
      # `nanos` parts scaled by 1 billion.
      # 
      # @returns [Float] a floating-point number representing the total seconds and
      # nanoseconds of the given time value.
      def to_f
        self.seconds + (self.nanos.quo(1_000_000_000))
      end
    end

    Duration.class_eval do
      # multiplies the instance variable `seconds` by the value of `nanos.to_f` divided
      # by one billion, returning a floating-point number representing the total duration
      # in seconds and nanoseconds.
      # 
      # @returns [Float] a floating-point number representing the total second count and
      # nanosecond count of the Time object.
      def to_f
        self.seconds + (self.nanos.to_f / 1_000_000_000)
      end
    end

    class UnexpectedStructType < Google::Protobuf::Error; end

    Value.class_eval do
      # converts a Struct value to Ruby hash or list, depending on the `recursive` parameter,
      # and returns the converted value or nil if it's a null value.
      # 
      # @param recursive [Boolean] whether to recursively convert nested structures within
      # the struct value.
      # 
      # @returns [Hash] a Ruby hash representation of the given struct value, depending
      # on its type.
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

      # takes a Ruby value as input and converts it into an equivalent Python value,
      # handling various types including ` NilClass`, `Numeric`, `String`, `TrueClass`,
      # `FalseClass`, `Struct`, `Hash`, `ListValue`, and `Array`.
      # 
      # @param value [Object] object being converted to Python's `struct`, and its type
      # determines the value that is assigned to the `number_value`, `string_value`,
      # `bool_value`, `struct_value`, `list_value`, or `array_value` attribute of the
      # returned `struct`.
      # 
      # @returns [Object] a reference to the appropriate value type based on the input value.
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

      # converts the instance variables to a hash by calling the `each` method on the
      # `fields` attribute and passing it the appropriate lambda to generate the corresponding
      # Ruby hash value.
      # 
      # @returns [Hash] a hash containing the object's fields and their corresponding
      # values in Ruby format.
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

      # checks if a key is present in an object's fields.
      # 
      # @param key [Object] key for which the method checks if it exists as a field in the
      # object's `fields` attribute.
      # 
      # @returns [Boolean] a boolean value indicating whether the given key exists in the
      # associated hash object's fields.
      def has_key?(key)
        self.fields.has_key?(key)
      end
    end

    ListValue.class_eval do
      include Enumerable

      # returns the number of values stored in an object's `values` attribute.
      # 
      # @returns [`Int32`.] the number of elements in the instance variable `self.values`.
      # 
      # 	The output is an integer value representing the length of the sequence represented
      # by the object.
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

      # applies a block of code to each value in an object's list, list of lists, or other
      # iterable data structure.
      # 
      # @returns [`Enumerable`.] an array of Ruby objects representing the elements passed
      # as arguments to the block.
      # 
      # 		- `self.values`: This is an instance method that takes anblock as its parameter.
      # It returns an enumerator that iterates over the elements of the `values` attribute
      # of the receiver object.
      # 		- `|x| yield(x.to_ruby)`: This line yields each element to the block, passing
      # it as a Ruby object (`x`) followed by the string `"to_ruby"`.
      def each
        self.values.each { |x| yield(x.to_ruby) }
      end

      # maps each element in a given collection to its corresponding Ruby value using `to_ruby`.
      # 
      # @returns [Object] an array of ruby objects representing the original code's values
      # after being transformed through the `to_ruby` method.
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
