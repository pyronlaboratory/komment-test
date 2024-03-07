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

      # modifies a message object's `type_url` attribute based on a provided prefix string,
      # ensuring the URL is proper and unique for the message class name.
      # 
      # @param msg [` :: Any`.] message that is being serialized and formatted according
      # to its type URL prefix.
      # 
      # 		- `msg.class.descriptor`: The class name of the message type being packed.
      # 		- `msg.to_proto`: The value of the message being packed, which is serialized and
      # encoded according to the message's format.
      # 
      # 
      # @param type_url_prefix [String] URL prefix for types, and when it is empty or ends
      # with a slash, it creates a unique type URL based on the class name of the message
      # being packed, otherwise it appends the type URL prefix to the class name to create
      # the unique type URL.
      # 
      # @returns [String] a URL string representing the protobuf message.
      def pack(msg, type_url_prefix='type.googleapis.com/')
        if type_url_prefix.empty? or type_url_prefix[-1] != '/' then
          self.type_url = "#{type_url_prefix}/#{msg.class.descriptor.name}"
        else
          self.type_url = "#{type_url_prefix}#{msg.class.descriptor.name}"
        end
        self.value = msg.to_proto
      end

      # decodes a value of a given subclass into the original value if it is of that class,
      # otherwise it returns `nil`.
      # 
      # @param klass [Object] class of an object that contains a method `decode` which is
      # called on the object when it is a subclass of the given class.
      # 
      # @returns [`nil`.] a decoded value of the specified class type.
      # 
      # 		- If `self.is(klass)`, then the `klass.decode(self.value)` method is called to
      # unpack the value of `self`. This method takes a string or bytes object and decodes
      # it into a Python object of the specified type.
      # 		- If `self.is not (klass)`, then the output is set to `nil`.
      def unpack(klass)
        if self.is(klass) then
          klass.decode(self.value)
        else
          nil
        end
      end

      # returns the name of a resource's type based on its URL fragment.
      # 
      # @returns [String] the last element of the URL path of the provided type URL.
      def type_name
        return self.type_url.split("/")[-1]
      end

      # determines whether an object's type name matches a given class descriptor name.
      # 
      # @param klass [Class] type of the object being tested, and the function returns
      # `True` if the object's type is equal to the specified type, and `False` otherwise.
      # 
      # @returns [`klass`.] a boolean value indicating whether the given object is of the
      # specified type.
      # 
      # 		- `klass`: The parameter passed to the `is` function, which represents the class
      # or type being checked.
      # 		- `self.type_name`: The name of the type or class being checked, as stored in
      # the instance's `type_name` attribute.
      # 		- `klass.descriptor.name`: The name of the class or type represented by the
      # `klass` parameter, as stored in its `descriptor.name` attribute.
      # 
      # 	In summary, the `is` function compares the type or class of an instance to a given
      # class or type, and returns a boolean value indicating whether they are equal.
      def is(klass)
        return self.type_name == klass.descriptor.name
      end
    end

    Timestamp.class_eval do
      # converts a seconds, nanoseconds value into a Time object with the specified
      # nanoseconds precision.
      # 
      # @returns [Object] a `Time` object representing the specified number of seconds and
      # nanoseconds since the Unix epoch.
      def to_time
        Time.at(seconds, nanos, :nanosecond)
      end

      def self.from_time(time)
        new.from_time(time)
      end

      # takes a `Time` object as input, converts it to an instance variable `self.seconds`
      # and `self.nanos`, and returns the modified object.
      # 
      # @param time [`Numeric`.] time value in seconds and nanoseconds, which are then
      # stored as instance variables `self.seconds` and `self.nanos`.
      # 
      # 		- `to_i`: This method converts the input time object to an integer value.
      # 		- `nsec`: This attribute provides the number of nanoseconds in the input time.
      # 
      # 
      # @returns [Time] an instance of the `Time` class with the given timestamp in seconds
      # and nanoseconds.
      def from_time(time)
        self.seconds = time.to_i
        self.nanos = time.nsec
        self
      end

      # converts its receiver, which is expected to be an instance of `Time`, into an
      # integer value representing the number of seconds since the epoch (January 1, 1970,
      # 00:00:00 UTC).
      # 
      # @returns [Integer] an integer representing the number of seconds in the provided
      # time object.
      def to_i
        self.seconds
      end

      # takes a Time object and returns its value as a float, representing the number of
      # seconds and nanoseconds since the Unix epoch.
      # 
      # @returns [Float] a float value representing the total number of seconds and
      # nanoseconds since the epoch.
      def to_f
        self.seconds + (self.nanos.quo(1_000_000_000))
      end
    end

    Duration.class_eval do
      # calculates the floating-point representation of a `Timestamp` instance by summing
      # the number of seconds and fractions of a second, represented as nanoseconds, and
      # converting them to floating-point representation.
      # 
      # @returns [Float] a float representing the time in seconds, rounded to the nearest
      # microsecond.
      def to_f
        self.seconds + (self.nanos.to_f / 1_000_000_000)
      end
    end

    class UnexpectedStructType < Google::Protobuf::Error; end

    Value.class_eval do
      # converts a struct value to Ruby format, recursively for lists and null values, and
      # returns the result as an hash, array, number, string, or boolean value based on
      # its kind attribute.
      # 
      # @param recursive [`boolean`.] whether to recursively convert the struct value or
      # not when calling the function.
      # 
      # 		- `recursive`: An optional boolean value indicating whether to recursively call
      # the `to_h` method on nested structures. If `true`, the method will call `to_h` on
      # any nested structures; if `false`, only top-level structures will be converted to
      # hashes.
      # 
      # 
      # @returns [String] a hash for struct values, an array for list values, or the
      # original value for all other types.
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

      # converts a Ruby value to an equivalent Swift struct value, handling various types
      # such as integers, strings, booleans, structures, hashes, and lists.
      # 
      # @param value [Object] struct to be converted into the target type, and its value
      # determines the resulting value of the `struct_value` attribute within the generated
      # documentation.
      # 
      # @returns [Object] a Python object representing the original Ruby value.
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

      # takes an instance of a class and converts its fields (represented by key-value
      # pairs) into a hash object in Ruby format, preserving the original values.
      # 
      # @returns [Hash] a hash of key-value pairs containing the object's fields converted
      # to ruby objects.
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
      # @param key [Object] key for which the method checks if it exists in the object's
      # fields.
      # 
      # @returns [`Boolean`.] a boolean indicating whether the given key exists as a field
      # in the object's fields hash.
      # 
      # 	The output is either a truthy value (i.e., `true`) if the key exists in the
      # `self.fields` dictionary, or a falsy value (`false`) otherwise.
      def has_key?(key)
        self.fields.has_key?(key)
      end
    end

    ListValue.class_eval do
      include Enumerable

      # returns the number of elements in an array-like object's value cache.
      # 
      # @returns [`Int32`.] the number of elements in the object's values array.
      # 
      # 		- The length is the number of values stored in the array.
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

      # iterates over the elements of an object's values and yields each element to a block
      # of code for processing.
      # 
      # @returns [`Enumerable`.] an array of Ruby objects corresponding to the values in
      # the `self.values` collection.
      # 
      # 		- The output is an array of the yielded values, each represented as a Ruby object.
      def each
        self.values.each { |x| yield(x.to_ruby) }
      end

      # maps the elements of an object's `self.values` list to Ruby objects using the
      # `to_ruby` method with the optional argument `true`.
      # 
      # @returns [Array] an array of Ruby objects representing the original data values.
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
