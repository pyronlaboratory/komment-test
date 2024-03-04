namespace Conhost.UIA.Tests
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Runtime.InteropServices;
    using System.Threading;

    using Microsoft.Win32;

    using WEX.Common.Managed;
    using WEX.Logging.Interop;
    using WEX.TestExecution;
    using WEX.TestExecution.Markup;

    using Conhost.UIA.Tests.Common;
    using Conhost.UIA.Tests.Common.NativeMethods;
    using Conhost.UIA.Tests.Elements;
    using OpenQA.Selenium.Appium;

    [TestClass]
    public class ExperimentalTabTests
    {
        public TestContext TestContext { get; set; }

        public const int timeout = Globals.Timeout;

        /// <summary> 
        /// verifies that all tabs and objects are enabled or disabled correctly when the 
        /// global v1/v2 state is manipulated. 
        /// </summary> 
        [TestMethod]
        [TestProperty("Ignore", "True")] // GH#7282 - investigate and reenable
        public void CheckExperimentalDisableState()
        {
            using (RegistryHelper reg = new RegistryHelper())
            {
                reg.BackupRegistry(); // manipulating the global v1/v2 state can affect the registry so back it up.

                using (CmdApp app = new CmdApp(CreateType.ProcessOnly, TestContext))
                {
                    using (PropertiesDialog properties = new PropertiesDialog(app))
                    {
                        properties.Open(OpenTarget.Defaults);

                        using (Tabs tabs = new Tabs(properties))
                        {
                            // check everything stays enabled when global is on.
                            AutoHelpers.LogInvariant("Check that items are all enabled when global is enabled.");
                            tabs.SetGlobalState(Tabs.GlobalState.ConsoleV2);

                            // iterate through each tab
                            AutoHelpers.LogInvariant("Checking elements on all tabs.");
                            foreach (TabBase tab in tabs.AllTabs)
                            {
                                tab.NavigateToTab();

                                IEnumerable<AppiumWebElement> itemsUnaffected = tab.GetObjectsUnaffectedByV1V2Switch();
                                IEnumerable<AppiumWebElement> itemsThatDisable = tab.GetObjectsDisabledForV1Console();

                                foreach (AppiumWebElement obj in itemsThatDisable.Concat(itemsUnaffected))
                                {
                                    Verify.IsTrue(obj.Enabled, AutoHelpers.FormatInvariant("Option: {0}", obj.Text));
                                }
                            }

                            // check that relevant boxes are disabled when global is off.
                            AutoHelpers.LogInvariant("Check that necessary items are disabled when global is disabled.");
                            tabs.SetGlobalState(Tabs.GlobalState.ConsoleV1);

                            foreach (TabBase tab in tabs.AllTabs)
                            {
                                tab.NavigateToTab();

                                IEnumerable<AppiumWebElement> itemsUnaffected = tab.GetObjectsUnaffectedByV1V2Switch();
                                IEnumerable<AppiumWebElement> itemsThatDisable = tab.GetObjectsDisabledForV1Console();

                                foreach (AppiumWebElement obj in itemsThatDisable)
                                {
                                    Verify.IsFalse(obj.Enabled, AutoHelpers.FormatInvariant("Option: {0}", obj.Text));
                                }
                                foreach (AppiumWebElement obj in itemsUnaffected)
                                {
                                    Verify.IsTrue(obj.Enabled, AutoHelpers.FormatInvariant("Option: {0}", obj.Text));
                                }
                            }
                        }
                    }
                }
            }
        }

        /// <summary> 
        /// tests the registry write-back functionality of a test application by creating a 
        /// backup, launching the application, and then comparing the original and modified 
        /// registries to ensure proper write-back. 
        /// </summary> 
        [TestMethod]
        [TestProperty("Ignore", "True")] // GH#7282 - investigate and reenable
        public void CheckRegistryWritebacks()
        {
            using (RegistryHelper reg = new RegistryHelper())
            {
                reg.BackupRegistry();

                using (CmdApp app = new CmdApp(CreateType.ProcessOnly, TestContext))
                {
                    this.CheckRegistryWritebacks(reg, app, OpenTarget.Defaults);
                    this.CheckRegistryWritebacks(reg, app, OpenTarget.Specifics);
                }
            }
        }

        /// <summary> 
        /// verifies that writebacks from a shortcut are properly applied to the specified 
        /// target, using an open-closed design pattern. 
        /// </summary> 
        [TestMethod]
        [TestProperty("Ignore", "True")] // GH#7282 - investigate and reenable
        public void CheckShortcutWritebacks()
        {
            using (RegistryHelper reg = new RegistryHelper())
            {
                // The global state changes can still impact the registry, so back up the registry anyway despite this being the shortcut test.
                reg.BackupRegistry();

                using (ShortcutHelper shortcut = new ShortcutHelper())
                {
                    shortcut.CreateTempCmdShortcut();

                    using (CmdApp app = new CmdApp(CreateType.ShortcutFile, TestContext, shortcut.ShortcutPath))
                    {
                        this.CheckShortcutWritebacks(shortcut, app, OpenTarget.Specifics);
                    }
                }
            }
        }

        private void CheckRegistryWritebacks(RegistryHelper reg, CmdApp app, OpenTarget target)
        {
            this.CheckWritebacks(reg, null, app, target);
        }

        private void CheckShortcutWritebacks(ShortcutHelper shortcut, CmdApp app, OpenTarget target)
        {
            this.CheckWritebacks(null, shortcut, app, target);
        }

        /// <summary> 
        /// verifies that writebacks from the registry or shortcut are properly saved and 
        /// updated in the target application when various settings are changed. 
        /// </summary> 
        /// <param name="reg"> 
        /// Registry settings for the target application, which is used to verify writebacks 
        /// in either registry or shortcut mode. 
        /// </param> 
        /// <param name="shortcut"> 
        /// shortcut option for writing back values, which is used to determine whether to use 
        /// the shortcut or registry writeback mechanism. 
        /// </param> 
        /// <param name="app"> 
        /// application instance for which the writeback functionality is being tested. 
        /// </param> 
        /// <param name="target"> 
        /// open target for which the writeback functionality is being tested, and it is passed 
        /// to the function as a parameter to identify the specific target for which the tests 
        /// are being performed. 
        /// </param> 
        private void CheckWritebacks(RegistryHelper reg, ShortcutHelper shortcut, CmdApp app, OpenTarget target)
        {
            // either registry or shortcut are null
            if ((reg == null && shortcut == null) || (reg != null && shortcut != null))
            {
                throw new NotSupportedException("Must leave either registry or shortcut null. And must supply one of the two.");
            }

            bool isRegMode = reg != null; // true is reg mode, false is shortcut mode

            string modeName = isRegMode ? "registry" : "shortcut";

            AutoHelpers.LogInvariant("Beginning {0} writeback tests for {1}", modeName, target.ToString());

            using (PropertiesDialog props = new PropertiesDialog(app))
            {
                // STEP 1: VERIFY EVERYTHING SAVES IN AN ON/MAX STATE
                AutoHelpers.LogInvariant("Open dialog and check boxes.");
                props.Open(target);

                using (Tabs tabs = new Tabs(props))
                {
                    // Set V2 on.
                    tabs.SetGlobalState(Tabs.GlobalState.ConsoleV2);

                    AutoHelpers.LogInvariant("Toggling elements on all tabs.");
                    foreach (TabBase tab in tabs.AllTabs)
                    {
                        tab.NavigateToTab();

                        foreach (CheckBoxMeta obj in tab.GetCheckboxesForVerification())
                        {
                            obj.Check();
                        }

                        foreach (SliderMeta obj in tab.GetSlidersForVerification())
                        {
                            // adjust slider to the maximum
                            obj.SetToMaximum();
                        }
                    }

                    AutoHelpers.LogInvariant("Hit OK to save.");
                    props.Close(PropertiesDialog.CloseAction.OK);

                    AutoHelpers.LogInvariant("Verify values changed as appropriate.");
                    CheckWritebacksVerifyValues(isRegMode, reg, shortcut, target, tabs, SliderMeta.ExpectedPosition.Maximum, false, Tabs.GlobalState.ConsoleV2);
                }

                // STEP 2: VERIFY EVERYTHING SAVES IN AN OFF/MIN STATE
                AutoHelpers.LogInvariant("Open dialog and uncheck boxes.");
                props.Open(target);

                using (Tabs tabs = new Tabs(props))
                {
                    AutoHelpers.LogInvariant("Toggling elements on all tabs.");
                    foreach (TabBase tab in tabs.AllTabs)
                    {
                        tab.NavigateToTab();

                        foreach (SliderMeta slider in tab.GetSlidersForVerification())
                        {
                            // adjust slider to the minimum
                            slider.SetToMinimum();
                        }

                        foreach (CheckBoxMeta obj in tab.GetCheckboxesForVerification())
                        {
                            obj.Uncheck();
                        }
                    }

                    tabs.SetGlobalState(Tabs.GlobalState.ConsoleV1);

                    AutoHelpers.LogInvariant("Hit OK to save.");
                    props.Close(PropertiesDialog.CloseAction.OK);

                    AutoHelpers.LogInvariant("Verify values changed as appropriate.");
                    CheckWritebacksVerifyValues(isRegMode, reg, shortcut, target, tabs, SliderMeta.ExpectedPosition.Minimum, true, Tabs.GlobalState.ConsoleV1);
                }

                // STEP 3: VERIFY CANCEL DOES NOT SAVE
                AutoHelpers.LogInvariant("Open dialog and check boxes.");
                props.Open(target);

                using (Tabs tabs = new Tabs(props))
                {
                    tabs.SetGlobalState(Tabs.GlobalState.ConsoleV2);

                    AutoHelpers.LogInvariant("Toggling elements on all tabs.");
                    foreach (TabBase tab in tabs.AllTabs)
                    {
                        tab.NavigateToTab();

                        foreach (CheckBoxMeta obj in tab.GetCheckboxesForVerification())
                        {
                            obj.Check();
                        }

                        foreach (SliderMeta obj in tab.GetSlidersForVerification())
                        {
                            // adjust slider to the maximum
                            obj.SetToMaximum();
                        }
                    }

                    AutoHelpers.LogInvariant("Hit cancel to not save.");
                    props.Close(PropertiesDialog.CloseAction.Cancel);

                    AutoHelpers.LogInvariant("Verify values did not change.");
                    CheckWritebacksVerifyValues(isRegMode, reg, shortcut, target, tabs, SliderMeta.ExpectedPosition.Minimum, true, Tabs.GlobalState.ConsoleV1);
                }
            }
        }

        /// <summary> 
        /// iterates through each tab in a set and verifies the values of writebacks, expected 
        /// positions of sliders, checkboxes, and global state of the console version. 
        /// </summary> 
        /// <param name="isRegMode"> 
        /// mode of operation (reg or non-reg) and affects the behavior of the function. 
        /// </param> 
        /// <param name="reg"> 
        /// 3rd party RegistryHelper class used to interact with the Windows registry. 
        /// </param> 
        /// <param name="shortcut"> 
        /// Shortcut helper class, which provides methods for working with shortcuts. 
        /// </param> 
        /// <param name="target"> 
        /// OpenTarget object that contains information about the target application or system 
        /// being evaluated for writebacks. 
        /// </param> 
        /// <param name="tabs"> 
        /// Tabs class instance that contains the values to be checked for consistency with 
        /// expected positions. 
        /// </param> 
        /// <param name="sliderExpected"> 
        /// expected position of the slider within the targeted tab. 
        /// </param> 
        /// <param name="checkboxValue"> 
        /// current value of the checkbox associated with the shortcut being verified. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// global state of the console version of the application. 
        /// </param> 
        private void CheckWritebacksVerifyValues(bool isRegMode, RegistryHelper reg, ShortcutHelper shortcut, OpenTarget target, Tabs tabs, SliderMeta.ExpectedPosition sliderExpected, bool checkboxValue, Tabs.GlobalState consoleVersion)
        {
            foreach (TabBase tab in tabs.AllTabs)
            {
                CheckWritebacksVerifyValues(isRegMode, reg, shortcut, target, tab, sliderExpected, checkboxValue, consoleVersion);
            }
        }

        /// <summary> 
        /// verifies the values of boxes, sliders, and checkboxes in a tab after they have 
        /// been written back to the registry or shortcut. 
        /// </summary> 
        /// <param name="isRegMode"> 
        /// mode of operation (registry or not) and determines whether to call `VerifyBoxes` 
        /// and `VerifySliders` functions. 
        /// </param> 
        /// <param name="reg"> 
        /// 3rd party library Registry Helper, which is used to interact with the registry. 
        /// </param> 
        /// <param name="shortcut"> 
        /// 3rd party shortcut that is being written back to the registry or file system. 
        /// </param> 
        /// <param name="target"> 
        /// OpenTarget instance that is associated with the current tab and serves as a reference 
        /// for verifying the written values. 
        /// </param> 
        /// <param name="tab"> 
        /// TabBase object that contains the current tab being processed during the writeback 
        /// verification process. 
        /// </param> 
        /// <param name="sliderExpected"> 
        /// expected position of a slider in the UI, which is used to verify its value after 
        /// it has been updated by the shortcut or RegMode operation. 
        /// </param> 
        /// <param name="checkboxValue"> 
        /// value of a checkbox in the UI being verified. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// current version of the console being used by the script, and is used to verify 
        /// that the correct version is being used for proper functionality. 
        /// </param> 
        private void CheckWritebacksVerifyValues(bool isRegMode, RegistryHelper reg, ShortcutHelper shortcut, OpenTarget target, TabBase tab, SliderMeta.ExpectedPosition sliderExpected, bool checkboxValue, Tabs.GlobalState consoleVersion)
        {
            if (isRegMode)
            {
                VerifyBoxes(tab, reg, checkboxValue, target, consoleVersion);
                VerifySliders(tab, reg, sliderExpected, target, consoleVersion);
            }
            else
            {
                // Have to wait for shortcut to get written. 
                // There isn't really an event to know when this occurs, so just wait.
                Globals.WaitForTimeout();

                VerifyBoxes(tab, shortcut, checkboxValue, consoleVersion);
                VerifySliders(tab, shortcut, sliderExpected, consoleVersion);
            }
        }

        /// <summary> 
        /// verifies the values of checkboxes associated with a tab, checking if they match 
        /// the expected value stored in the registry. It accounts for inverse boxes and console 
        /// version differences. 
        /// </summary> 
        /// <param name="tab"> 
        /// TabBase object that contains the checkboxes to be verified for their registry values. 
        /// </param> 
        /// <param name="reg"> 
        /// RegistryHelper object that provides access to the target's registry keys and values 
        /// for verification purposes. 
        /// </param> 
        /// <param name="inverse"> 
        /// inverse state of the boxes being verified, where `true` means the box should be 
        /// false and `false` means the box should be on. 
        /// </param> 
        /// <param name="target"> 
        /// target application or feature to be verified, and determines which boxes to include 
        /// in the verification process. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// 32-bit or 64-bit version of the registry viewer used to generate high-quality 
        /// documentation for the code being passed, and affects how the boxes are validated 
        /// in the Verify method. 
        /// </param> 
        private void VerifyBoxes(TabBase tab, RegistryHelper reg, bool inverse, OpenTarget target, Tabs.GlobalState consoleVersion)
        {
            // get the key for the current target
            RegistryKey consoleKey = reg.GetMatchingKey(target);

            // hold the parent console key in case we need to look things up for specifics.
            RegistryKey parentConsoleKey = reg.GetMatchingKey(OpenTarget.Defaults);

            // include the global checkbox in the set for verification purposes
            IEnumerable<CheckBoxMeta> boxes = tab.GetCheckboxesForVerification();

            AutoHelpers.LogInvariant("Testing target: {0} in inverse {1} mode", target.ToString(), inverse.ToString());

            // If we're opened as specifics, remove all global only boxes from the test set
            if (target == OpenTarget.Specifics)
            {
                AutoHelpers.LogInvariant("Reducing");
                boxes = boxes.Where(box => !box.IsGlobalOnly);
            }

            foreach (CheckBoxMeta meta in boxes)
            {
                int? storedValue = consoleKey.GetValue(meta.ValueName) as int?;

                string boxName = AutoHelpers.FormatInvariant("Box: {0}", meta.ValueName);

                // if we're in specifics mode, we might have a null and if so, we check the parent value
                if (target == OpenTarget.Specifics)
                {
                    if (storedValue == null)
                    {
                        AutoHelpers.LogInvariant("Specific setting missing. Checking defaults.");
                        storedValue = parentConsoleKey.GetValue(meta.ValueName) as int?;
                    }
                }
                else
                {
                    Verify.IsNotNull(storedValue, boxName);
                }

                if (consoleVersion == Tabs.GlobalState.ConsoleV1 && meta.IsV2Property)
                {
                    AutoHelpers.LogInvariant("Skipping validation of v2 property {0} after switching to v1 console.", meta.ValueName);
                }
                else
                {
                    // A box can be inverse if checking it means false in the registry.
                    // This method can be inverse if we're turning off the boxes and expecting it to be on.
                    // Therefore, a box will be false if it's checked and supposed to be off. Or if it's unchecked and supposed to be on.
                    if ((meta.IsInverse && !inverse) || (!meta.IsInverse && inverse))
                    {
                        Verify.IsFalse(storedValue.Value.DwordToBool(), boxName);
                    }
                    else
                    {
                        Verify.IsTrue(storedValue.Value.DwordToBool(), boxName);
                    }
                }
            }
        }

        /// <summary> 
        /// enumerates and validates the values of checkboxes in a TabBase, using the shortcut's 
        /// GetFromPropertyStore method to retrieve property data. It checks each box's value 
        /// against its expected state based on its PropKey and whether it is inverse. 
        /// </summary> 
        /// <param name="tab"> 
        /// TabBase object that contains the Checkboxes to be verified. 
        /// </param> 
        /// <param name="shortcut"> 
        /// implementation class for storing property values, which is used to retrieve property 
        /// keys for validation. 
        /// </param> 
        /// <param name="inverse"> 
        /// inverse state of the boxes to be verified, where `true` means the box should be 
        /// turned off and `false` means it should be turned on. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// 32-bit vs 64-bit version of the console, which determines whether or not to skip 
        /// validation of certain v2 properties in the verification process. 
        /// </param> 
        private void VerifyBoxes(TabBase tab, ShortcutHelper shortcut, bool inverse, Tabs.GlobalState consoleVersion)
        {
            IEnumerable<CheckBoxMeta> boxes = tab.GetCheckboxesForVerification();

            // collect up properties that we need to retrieve keys for
            IEnumerable<CheckBoxMeta> propBoxes = boxes.Where(box => box.PropKey != null);
            IEnumerable<Wtypes.PROPERTYKEY> keys = propBoxes.Select(box => box.PropKey).Cast<Wtypes.PROPERTYKEY>();

            // fetch data for keys
            IDictionary<Wtypes.PROPERTYKEY, object> propertyData = shortcut.GetFromPropertyStore(keys);

            // enumerate each box and validate the data
            foreach (CheckBoxMeta meta in propBoxes)
            {
                string boxName = AutoHelpers.FormatInvariant("Box: {0}", meta.ValueName);

                Wtypes.PROPERTYKEY key = (Wtypes.PROPERTYKEY)meta.PropKey;

                bool? value = (bool?)propertyData[key];

                Verify.IsNotNull(value, boxName);

                if (consoleVersion == Tabs.GlobalState.ConsoleV1 && meta.IsV2Property)
                {
                    AutoHelpers.LogInvariant("Skipping validation of v2 property {0} after switching to v1 console.", meta.ValueName);
                }
                else
                {
                    // A box can be inverse if checking it means false in the registry.
                    // This method can be inverse if we're turning off the boxes and expecting it to be on.
                    // Therefore, a box will be false if it's checked and supposed to be off. Or if it's unchecked and supposed to be on.
                    if ((meta.IsInverse && !inverse) || (!meta.IsInverse && inverse))
                    {
                        Verify.IsFalse(value.Value, boxName);
                    }
                    else
                    {
                        Verify.IsTrue(value.Value, boxName);
                    }
                }
            }
        }

        /// <summary> 
        /// verifies the values of sliders in a given tab against their expected positions, 
        /// using the specified console version. It iterates over the sliders in the tab, 
        /// checks the stored value against the expected position, and logs any discrepancies 
        /// for further analysis. 
        /// </summary> 
        /// <param name="tab"> 
        /// TabBase object that contains the sliders to be verified. 
        /// </param> 
        /// <param name="reg"> 
        /// 3rd-party library that contains various configuration options for the tab, and is 
        /// used to retrieve the matching registry keys for each target. 
        /// </param> 
        /// <param name="expected"> 
        /// expected position of each slider, which is used to verify whether the stored value 
        /// of each slider is equal to its maximum or minimum value. 
        /// </param> 
        /// <param name="target"> 
        /// target OpenTarget for which the sliders should be verified, and determines whether 
        /// specific or default settings are checked. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// 32-bit console version that the function is running under, which determines whether 
        /// to use V1 or V2 property validation for each slider value. 
        /// </param> 
        private void VerifySliders(TabBase tab, RegistryHelper reg, SliderMeta.ExpectedPosition expected, OpenTarget target, Tabs.GlobalState consoleVersion)
        {
            // get the key for the current target
            RegistryKey consoleKey = reg.GetMatchingKey(target);

            // hold the parent console key in case we need to look things up for specifics.
            RegistryKey parentConsoleKey = reg.GetMatchingKey(OpenTarget.Defaults);

            IEnumerable<SliderMeta> sliders = tab.GetSlidersForVerification();

            foreach (SliderMeta meta in sliders)
            {
                int? storedValue = consoleKey.GetValue(meta.ValueName) as int?;

                string sliderName = AutoHelpers.FormatInvariant("Slider: {0}", meta.ValueName);

                if (target == OpenTarget.Specifics)
                {
                    if (storedValue == null)
                    {
                        AutoHelpers.LogInvariant("Specific setting missing. Checking defaults.");
                        storedValue = parentConsoleKey.GetValue(meta.ValueName) as int?;
                    }
                }
                else
                {
                    Verify.IsNotNull(storedValue, sliderName);
                }

                int transparency = 0;

                switch (expected)
                {
                    case SliderMeta.ExpectedPosition.Maximum:
                        transparency = meta.GetMaximum();
                        break;
                    case SliderMeta.ExpectedPosition.Minimum:
                        transparency = meta.GetMinimum();
                        break;
                    default:
                        throw new NotImplementedException();
                }

                if (consoleVersion == Tabs.GlobalState.ConsoleV1 && meta.IsV2Property)
                {
                    AutoHelpers.LogInvariant("Skipping validation of v2 property {0} after switching to v1 console.", meta.ValueName);
                }
                else
                {
                    Verify.AreEqual(storedValue.Value, RescaleSlider(transparency), sliderName);
                }
            }
        }

        /// <summary> 
        /// verifies the expected position of sliders based on their properties and the current 
        /// console version. It retrieves data for each slider's property key, enumerates 
        /// through each slider, and compares its value to the expected value after rescaling 
        /// for transparency. 
        /// </summary> 
        /// <param name="tab"> 
        /// tab component for which the sliders need to be verified. 
        /// </param> 
        /// <param name="shortcut"> 
        /// object that provides access to the data for the sliders being verified, allowing 
        /// the function to retrieve the necessary property keys and values from it. 
        /// </param> 
        /// <param name="expected"> 
        /// expected position of the slider, which determines the validation logic for each 
        /// slider in the function. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// version of the console being used and determines whether to validate v2 properties 
        /// or not. 
        /// </param> 
        private void VerifySliders(TabBase tab, ShortcutHelper shortcut, SliderMeta.ExpectedPosition expected, Tabs.GlobalState consoleVersion)
        {
            IEnumerable<SliderMeta> sliders = tab.GetSlidersForVerification();

            // collect up properties that we need to retrieve keys for
            IEnumerable<SliderMeta> propSliders = sliders.Where(slider => slider.PropKey != null);
            IEnumerable<Wtypes.PROPERTYKEY> keys = propSliders.Select(slider => slider.PropKey).Cast<Wtypes.PROPERTYKEY>();

            // fetch data for keys
            IDictionary<Wtypes.PROPERTYKEY, object> propertyData = shortcut.GetFromPropertyStore(keys);

            // enumerate each slider and validate data
            foreach (SliderMeta meta in sliders)
            {
                string sliderName = AutoHelpers.FormatInvariant("Slider: {0}", meta.ValueName);

                Wtypes.PROPERTYKEY key = (Wtypes.PROPERTYKEY)meta.PropKey;

                short value = (short)propertyData[key];

                int transparency = 0;

                switch (expected)
                {
                    case SliderMeta.ExpectedPosition.Maximum:
                        transparency = meta.GetMaximum();
                        break;
                    case SliderMeta.ExpectedPosition.Minimum:
                        transparency = meta.GetMinimum();
                        break;
                    default:
                        throw new NotImplementedException();
                }

                if (consoleVersion == Tabs.GlobalState.ConsoleV1 && meta.IsV2Property)
                {
                    AutoHelpers.LogInvariant("Skipping validation of v2 property {0} after switching to v1 console.", meta.ValueName);
                }
                else
                {
                    Verify.AreEqual(value, RescaleSlider(transparency), sliderName);
                }
            }
        }

        /// <summary> 
        /// rescales an input value within a range of 0x4D to 0xFF using a scale factor 
        /// calculated as the input value divided by 100, then returns the resulting short value. 
        /// </summary> 
        /// <param name="inputValue"> 
        /// 0-100 range value that will be rescaled to a value between 0x4D and 0xFF. 
        /// </param> 
        /// <returns> 
        /// a short value between 0x4D and 0xFF, inclusive. 
        /// </returns> 
        private short RescaleSlider(int inputValue)
        {
            // we go on a scale from 0x4D to 0xFF.
            int minValue = 0x4D;
            int maxValue = 0xFF;

            int valueRange = maxValue - minValue;

            double scaleFactor = (double)inputValue / 100.0;

            short finalValue = (short)((valueRange * scaleFactor) + minValue);

            return finalValue;
        }
    }
}
