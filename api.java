private void writeApi(Multimap<String, MethodSpec> groupedMethods) {
  Map<String, ClassName> groups = new HashMap<>();

  for (Map.Entry<String, Collection<MethodSpec>> entry : groupedMethods.asMap().entrySet()) {
    if (!entry.getKey().isEmpty()) {
      TypeSpec groupClass = buildGroupClass(entry.getKey(), entry.getValue());
      write(groupClass);
      groups.put(entry.getKey(), ClassName.get("org.tensorflow.op", groupClass.name));
    }
  }

  TypeSpec topClass = buildTopClass(groups, groupedMethods.get(""));
  write(topClass);
}

private boolean collectOpsMethods(
    RoundEnvironment roundEnv,
    Multimap<String, MethodSpec> groupedMethods,
    TypeElement annotation) {
  boolean result = true;
  for (Element e : roundEnv.getElementsAnnotatedWith(annotation)) {
    if (!(e instanceof TypeElement)) {
      error(
          e,
          "@Operator can only be applied to classes, but this is a %s",
          e.getKind().toString());
      result = false;
      continue;
    }
    TypeElement opClass = (TypeElement) e;
    if (opClass.getAnnotation(Deprecated.class) == null) {
      collectOpMethods(groupedMethods, opClass, annotation);
    }
  }
  return result;
}
