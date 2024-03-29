def create_deployment_object():
    """
    This function creates a Kubernetes Deployment object with the specified attributes.

    Returns:
        : The output returned by the function is an object of type `Client.V1Deployment`.

    """
    container = client.V1Container(
        name="nginx-sample",
        image="nginx",
        image_pull_policy="IfNotPresent",
        ports=[client.V1ContainerPort(container_port=80)],
    )
    # Template
    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(labels={"app": "nginx"}),
        spec=client.V1PodSpec(containers=[container]))
    # Spec
    spec = client.V1DeploymentSpec(
        replicas=1,
        selector=client.V1LabelSelector(
            match_labels={"app": "nginx"}
        ),
        template=template)
    # Deployment
    deployment = client.V1Deployment(
        api_version="apps/v1",
        kind="Deployment",
        metadata=client.V1ObjectMeta(name="deploy-nginx"),
        spec=spec)

    return deployment
