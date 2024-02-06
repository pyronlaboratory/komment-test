import org.lwjgl.glfw.GLFW;
import org.lwjgl.opengl.GL;
import org.lwjgl.opengl.GL11;
import org.lwjgl.opengl.GLUtil;

import static org.lwjgl.glfw.Callbacks.glfwFreeCallbacks;
import static org.lwjgl.glfw.GLFW.*;
import static org.lwjgl.system.MemoryStack.stackPush;
import static org.lwjgl.system.MemoryUtil.NULL;

public class SimpleOpenGLDemo {

    private long window;

    /**
     * The provided code defines a `run()` function that performs the following actions:
     * 
     * 1/ Initializes some unspecified context using the `init()` method.
     * 2/ Loops until an unknown condition is met using the `loop()` method.
     * 3/ Releases any resources allocated by `glfwFreeCallbacks()` and `glfwDestroyWindow()`.
     * 4/ Finalizes GLFW library usage by calling `glfwTerminate()`.
     */
    public void run() {
        init();
        loop();

        glfwFreeCallbacks(window);
        glfwDestroyWindow(window);

        glfwTerminate();
    }

    /**
     * Initializes an OpenGL application with GLFW. It sets up the GLFW window hints and
     * creates a GLFW window with specified size and title. Additionally it sets the
     * window position based on the primary monitor's video mode and makes the context
     * current. Finally it sets up debug messaging and creates a Capabilities object.
     */
    private void init() {
        if (!glfwInit()) {
            throw new IllegalStateException("Unable to initialize GLFW");
        }

        glfwDefaultWindowHints();
        glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
        glfwWindowHint(GLFW_RESIZABLE, GLFW_TRUE);

        window = glfwCreateWindow(800, 600, "Simple OpenGL Demo", NULL, NULL);
        if (window == NULL) {
            throw new RuntimeException("Failed to create the GLFW window");
        }

        try (var stack = stackPush()) {
            var pWidth = stack.mallocInt(1);
            var pHeight = stack.mallocInt(1);

            glfwGetWindowSize(window, pWidth, pHeight);

            var vidMode = glfwGetVideoMode(glfwGetPrimaryMonitor());

            glfwSetWindowPos(
                    window,
                    (vidMode.width() - pWidth.get(0)) / 2,
                    (vidMode.height() - pHeight.get(0)) / 2
            );

            glfwMakeContextCurrent(window);
            glfwSwapInterval(1);
            glfwShowWindow(window);

            GL.createCapabilities();

            glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
            glEnable(GL_DEPTH_TEST);
        }

        GLUtil.setupDebugMessageCallback();
    }

    /**
     * Clear the color and depth buffers and start a new GL_TRIANGLES drawing primitive.
     */
    private void loop() {
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        // Your OpenGL drawing code goes here
        glBegin(GL_TRIANGLES);
        glColor3f(1.0f, 0.0f, 0.0f);
        glVertex2f(-0.6f, -0.4f);
        glColor3f(0.0f, 1.0f, 0.0f);
        glVertex2f(0.6f, -0.4f);
        glColor3f(0.0f, 0.0f, 1.0f);
        glVertex2f(0.0f, 0.6f);
        glEnd();

        glfwSwapBuffers(window);

        while (!glfwWindowShouldClose(window)) {
            glfwPollEvents();
        }
    }

    /**
     * CREATE A NEW INSTANCE OF SIMPLEOPENGLDEMO AND CALL RUN();
     * 
     * @param args Array of strings passed to a method with same name as the class
     */
    public static void main(String[] args) {
        new SimpleOpenGLDemo().run();
    }
}
