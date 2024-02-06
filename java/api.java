/**
 * The given function writes an API for a set of methods using their grouping keys
 * and types.
 * 
 * @param groupedMethods Here is a concise answer:
 * 
 * groupedMethods supplies a Multimap of Strings to MethodSpec collections
 */
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

/**
 * Collects method from elements annotated with @Operator and checks if the methods
 * are deprecated. If not deprecated then it collects the methods for further processing.
 * 
 * @param roundEnv roundEnvironment provides the elements annotated with @Operator
 * and any error messages can be thrown regarding element kinds.
 * 
 * @param groupedMethods GROUPEDMETHODS COLLECTS METHOD SPECIFICATIONS.
 * 
 * @param annotation The `annotation` parameter is the TypeElement annotated with @Operator.
 * 
 * @returns Collects op-methods. Returns a boolean value indicating whether all of
 * the methods have been processed without an error.
 */
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
