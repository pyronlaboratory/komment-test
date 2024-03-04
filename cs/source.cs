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
        /// verifies that options are enabled or disabled correctly when the global v1/v2 state 
        /// is changed. 
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
        /// verifies that write-backs from a process to the registry are correctly handled by 
        /// the registry component, including backup and restore operations. 
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
        /// verifies that writebacks are properly updated when creating a temp command shortcut 
        /// using `CmdApp`. 
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

        /// <summary> 
        /// verifies the write-back operations for a given Registry, Command Application, and 
        /// Open Target. 
        /// </summary> 
        /// <param name="reg"> 
        /// RegistryHelper object that contains the registry information to be checked for writebacks. 
        /// </param> 
        /// <param name="app"> 
        /// command application for which writebacks are being checked. 
        /// </param> 
        /// <param name="target"> 
        /// open target for which the writebacks are being checked. 
        /// </param> 
        private void CheckRegistryWritebacks(RegistryHelper reg, CmdApp app, OpenTarget target)
        {
            this.CheckWritebacks(reg, null, app, target);
        }

        /// <summary> 
        /// verifies that any write-backs associated with a given shortcut are properly 
        /// synchronized with the corresponding application and target. 
        /// </summary> 
        /// <param name="shortcut"> 
        /// Shortcut object that is being written back to the application. 
        /// </param> 
        /// <param name="app"> 
        /// CmdApp object that provides access to the target platform's functionality for 
        /// writing back data. 
        /// </param> 
        /// <param name="target"> 
        /// open target for which the writebacks are being checked. 
        /// </param> 
        private void CheckShortcutWritebacks(ShortcutHelper shortcut, CmdApp app, OpenTarget target)
        {
            this.CheckWritebacks(null, shortcut, app, target);
        }

        /// <summary> 
        /// verifies that changes made to checkboxes and sliders in a PropertiesDialog are 
        /// properly saved when the dialog is closed either through OK or Cancel. 
        /// </summary> 
        /// <param name="reg"> 
        /// registry object to be used for writeback testing. 
        /// </param> 
        /// <param name="shortcut"> 
        /// 2nd mode of writeback testing, where shortcuts are used instead of registry values. 
        /// </param> 
        /// <param name="app"> 
        /// CmdApp object that is used to provide access to the application's functionality 
        /// and state for verifying writebacks. 
        /// </param> 
        /// <param name="target"> 
        /// OpenTarget object that the writeback tests are being performed on, and is used to 
        /// identify the specific target for which the writebacks are being verified. 
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
        /// iterates through all tabs in a `Tabs` collection and calls itself recursively for 
        /// each tab, passing the appropriate parameters. 
        /// </summary> 
        /// <param name="isRegMode"> 
        /// mode of the application, whether it's regular or registry mode. 
        /// </param> 
        /// <param name="reg"> 
        /// 3rd party registry helper object that contains metadata and values for the targets 
        /// to be checked for writebacks. 
        /// </param> 
        /// <param name="shortcut"> 
        /// ShortcutHelper object that contains information about the shortcut associated with 
        /// the target. 
        /// </param> 
        /// <param name="target"> 
        /// OpenTarget object that contains the current target file or directory being processed 
        /// by the function. 
        /// </param> 
        /// <param name="tabs"> 
        /// Tabs class instance that contains information about all tabs in the current document. 
        /// </param> 
        /// <param name="sliderExpected"> 
        /// expected position of a slider in the UI. 
        /// </param> 
        /// <param name="checkboxValue"> 
        /// value of a checkbox associated with the corresponding tab. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// version of the console application being executed by the shortcut, and is used to 
        /// determine the appropriate behavior for certain actions within the function. 
        /// </param> 
        private void CheckWritebacksVerifyValues(bool isRegMode, RegistryHelper reg, ShortcutHelper shortcut, OpenTarget target, Tabs tabs, SliderMeta.ExpectedPosition sliderExpected, bool checkboxValue, Tabs.GlobalState consoleVersion)
        {
            foreach (TabBase tab in tabs.AllTabs)
            {
                CheckWritebacksVerifyValues(isRegMode, reg, shortcut, target, tab, sliderExpected, checkboxValue, consoleVersion);
            }
        }

        /// <summary> 
        /// verifies the values of boxes, sliders, and checkboxes in a TabBase object based 
        /// on the provided RegistryHelper, ShortcutHelper, OpenTarget, and consoleVersion. 
        /// It performs these actions either in registry mode or after waiting for a timeout 
        /// when in non-registry mode. 
        /// </summary> 
        /// <param name="isRegMode"> 
        /// mode of operation, either registration or non-registration, and determines which 
        /// verification routines to execute. 
        /// </param> 
        /// <param name="reg"> 
        /// 3rd party Registry class that contains the registry data being checked for writeback 
        /// values. 
        /// </param> 
        /// <param name="shortcut"> 
        /// 3rd party OpenTarget shortcut that is being written back to the registry by the 
        /// CheckWritebacks method. 
        /// </param> 
        /// <param name="target"> 
        /// OpenTarget object that provides information about the current target being processed. 
        /// </param> 
        /// <param name="tab"> 
        /// currently selected tab in the IDE and is used to verify its state during the 
        /// writeback process. 
        /// </param> 
        /// <param name="sliderExpected"> 
        /// expected position of a slider in relation to its target value, which is used to 
        /// verify the slider's position during execution. 
        /// </param> 
        /// <param name="checkboxValue"> 
        /// value of the checkbox associated with the tab being checked. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// version of the console being used, which is used to verify the correctness of the 
        /// writeback process. 
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
        /// verifies the state of checkboxes in a given registry key based on the target opened 
        /// and the console version. It iterates through the list of checkboxes, verifying the 
        /// stored value against the expected result for each box. 
        /// </summary> 
        /// <param name="tab"> 
        /// TabBase object that contains the Checkboxes to be verified. 
        /// </param> 
        /// <param name="reg"> 
        /// RegistryHelper object that provides access to the target's registry keys and values 
        /// for verification purposes. 
        /// </param> 
        /// <param name="inverse"> 
        /// mode of the target, whether it's specific or not, and affects the validation of boxes. 
        /// </param> 
        /// <param name="target"> 
        /// OpenTarget for which the boxes are being verified, and it is used to determine 
        /// whether to include global-only boxes in the test set or not. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// 32-bit console version of the OpenBoxes control, which is used to determine how 
        /// to handle certain properties and their corresponding validation in the VerifyBoxes 
        /// method. 
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
        /// verifies the data associated with a set of checkboxes based on their prop key and 
        /// value name, and console version. 
        /// </summary> 
        /// <param name="tab"> 
        /// TabBase object that contains the Checkboxes to be verified. 
        /// </param> 
        /// <param name="shortcut"> 
        /// GetFromPropertyStore method's shortcut, which is used to quickly retrieve data 
        /// from the property store. 
        /// </param> 
        /// <param name="inverse"> 
        /// opposite of the expected state for each checked box, where `true` means the box 
        /// should be off and `false` means it should be on. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// console version for which the shortcuts need to be verified, and it is used to 
        /// skip validation of v2 properties when switching to v1 console. 
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
        /// iterates over a list of sliders in a given tab, retrieves their stored values from 
        /// the registry, and compares them to expected values for each slider. It also rescales 
        /// the expected values if necessary for compatibility with an older console version. 
        /// </summary> 
        /// <param name="tab"> 
        /// 3D tab object that contains the sliders to be verified for their position. 
        /// </param> 
        /// <param name="reg"> 
        /// registry helper object that provides methods for accessing and manipulating registry 
        /// values. 
        /// </param> 
        /// <param name="expected"> 
        /// expected position of the slider, which is used to compare the stored value with 
        /// the expected value for each slider in the verification process. 
        /// </param> 
        /// <param name="target"> 
        /// specific or default target for which the sliders are being verified, and is used 
        /// to determine whether to look up the value in the registry or use the default value. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// 1/x or 2.x version of the console being used, and it affects how certain slider 
        /// properties are validated. 
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
        /// iterates over a list of sliders in a tab and validates that their values match 
        /// expected positions. It uses a global state variable to determine which version of 
        /// the console is being used, and switches between v1 and v2 validation accordingly. 
        /// </summary> 
        /// <param name="tab"> 
        /// TabBase object that contains the sliders to be verified for their position. 
        /// </param> 
        /// <param name="shortcut"> 
        /// shortcut object that contains the data to be validated for each slider. 
        /// </param> 
        /// <param name="expected"> 
        /// ExpectedPosition of the slider, which determines the range of values to be validated 
        /// for each slider. 
        /// </param> 
        /// <param name="consoleVersion"> 
        /// version of the console application being used, and is used to determine whether 
        /// to validate v2 properties or not. 
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
        /// rescales an input value within a range of 0x4D to 0xFF, returning a short value 
        /// with the same scale as the original input value. 
        /// </summary> 
        /// <param name="inputValue"> 
        /// 0-based integer value that will be rescaled within the specified range of 0x4D to 
        /// 0xFF. 
        /// </param> 
        /// <returns> 
        /// a short value between 0x4D and 0xFF, scaled based on an input value. 
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
