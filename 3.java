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
     * terminate() and destroy window()) callbacks.
     */
    public void run() {
        init();
        loop();

        glfwFreeCallbacks(window);
        glfwDestroyWindow(window);

        glfwTerminate();
    }

    /**
     * Initializes GLFW and creates a window with the specified dimensions and visible state.
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
     * Clear the color and depth buffers; draw a triangle with colors blue-negative(x-axis),
     * green-positive (y-axis), and red-0(z-axis) using glBegin(GL_TRIANGLES) and glEnd();
     * swap buffers and poll events.
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
     * OF COURSE. HERE IS YOUR ANSWER.
     * 
     * main creates a new instance of the SimpleOpenGL Demo class and invokes the run method.
     * 
     * @param args START
     * 
     * The `args` parameter is passed to the `main` method as an array of strings and
     * represents the command line arguments. The method caller can specify options and
     * arguments for the application through this parameter. END
     */
    public static void main(String[] args) {
        new SimpleOpenGLDemo().run();
    }
}
