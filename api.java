private void writeApi(Multimap<String, MethodSpec> groupedMethods) {
  Map<String, ClassName> groups = new HashMap<>();

  // Generate a API class for each group collected other than the default one (= empty string)
  for (Map.Entry<String, Collection<MethodSpec>> entry : groupedMethods.asMap().entrySet()) {
    if (!entry.getKey().isEmpty()) {
      TypeSpec groupClass = buildGroupClass(entry.getKey(), entry.getValue());
      write(groupClass);
      groups.put(entry.getKey(), ClassName.get("org.tensorflow.op", groupClass.name));
    }
  }
  // Generate the top API class, adding any methods added to the default group
  TypeSpec topClass = buildTopClass(groups, groupedMethods.get(""));
  write(topClass);
}

private boolean collectOpsMethods(
    RoundEnvironment roundEnv,
    Multimap<String, MethodSpec> groupedMethods,
    TypeElement annotation) {
  boolean result = true;
  for (Element e : roundEnv.getElementsAnnotatedWith(annotation)) {
    // @Operator can only apply to types, so e must be a TypeElement.
    if (!(e instanceof TypeElement)) {
      error(
          e,
          "@Operator can only be applied to classes, but this is a %s",
          e.getKind().toString());
      result = false;
      continue;
    }
    TypeElement opClass = (TypeElement) e;
    // Skip deprecated operations for now, as we do not guarantee API stability yet
    if (opClass.getAnnotation(Deprecated.class) == null) {
      collectOpMethods(groupedMethods, opClass, annotation);
    }
  }
  return result;
}
