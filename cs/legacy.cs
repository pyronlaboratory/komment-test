//#define LL1_tracing
namespace Prolog
{
    using System;
    using System.IO;
    using System.Text;
    using System.Xml;
    using System.Collections;
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using System.Globalization;
    using System.Threading;
    using System.Diagnostics;

    /* _______________________________________________________________________________________________
      |                                                                                               |
      |  C#Prolog -- Copyright (C) 2007 John Pool -- j.pool@ision.nl                                  |
      |                                                                                               |
      |  This library is free software; you can redistribute it and/or modify it under the terms of   |
      |  the GNU General Public License as published by the Free Software Foundation; either version  |
      |  2 of the License, or any later version.                                                      |
      |                                                                                               |
      |  This library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;    |
      |  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    |
      |  See the GNU General Public License for details, or enter 'license.' at the command prompt.   |
      |_______________________________________________________________________________________________|
    */

    // Parser Generator version 4.0 -- Date/Time: 03-Apr-14 21:12:01


    public partial class PrologEngine
    {
        #region PrologParser
        public partial class PrologParser : BaseParser<OpDescrTriplet>
        {
            public static readonly string VersionTimeStamp = "2014-04-03 21:12:01";
            protected override char ppChar { get { return '!'; } }

            #region Terminal definition

            /* The following constants are defined in BaseParser.cs:
            const int Undefined = 0;
            const int Comma = 1;
            const int LeftParen = 2;
            const int RightParen = 3;
            const int Identifier = 4;
            const int IntLiteral = 5;
            const int ppDefine = 6;
            const int ppUndefine = 7;
            const int ppIf = 8;
            const int ppIfNot = 9;
            const int ppElse = 10;
            const int ppElseIf = 11;
            const int ppEndIf = 12;
            const int RealLiteral = 13;
            const int ImagLiteral = 14;
            const int StringLiteral = 15;
            const int CharLiteral = 16;
            const int CommentStart = 17;
            const int CommentSingle = 18;
            const int EndOfLine = 19;
            const int ANYSYM = 20;
            const int EndOfInput = 21;
            */
            const int Operator = 22;
            const int Atom = 23;
            const int VerbatimStringStart = 24;
            const int Dot = 25;
            const int Anonymous = 26;
            const int CutSym = 27;
            const int ImpliesSym = 28;
            const int PromptSym = 29;
            const int DCGArrowSym = 30;
            const int BuiltinCSharp = 31;
            const int LSqBracket = 32;
            const int RSqBracket = 33;
            const int LCuBracket = 34;
            const int RCuBracket = 35;
            const int VBar = 36;
            const int OpSym = 37;
            const int WrapSym = 38;
            const int BuiltinSym = 39;
            const int ProgramSym = 40;
            const int ReadingSym = 41;
            const int EnsureLoaded = 42;
            const int Discontiguous = 43;
            const int StringStyle = 44;
            const int AllDiscontiguous = 45;
            const int Module = 46;
            const int Dynamic = 47;
            const int ListPatternOpen = 48;
            const int ListPatternClose = 49;
            const int EllipsisSym = 50;
            const int SubtreeSym = 51;
            const int NegateSym = 52;
            const int PlusSym = 53;
            const int TimesSym = 54;
            const int QuestionMark = 55;
            const int QuestionMarks = 56;
            const int TrySym = 57;
            const int CatchSym = 58;
            const int WrapOpen = 59;
            const int WrapClose = 60;
            const int AltListOpen = 61;
            const int AltListClose = 62;
            const int Slash = 63;
            const int VerbatimStringLiteral = 64;
            // Total number of terminals:
            public const int terminalCount = 65;

            /// <summary> 
            /// adds symbols to a terminal table based on their type and class. 
            /// </summary> 
            /// <param name="terminalTable"> 
            /// 2D table of terminal symbols and their corresponding symbol classes, which are 
            /// populated with values from the `BaseTrie` object passed to the function. 
            /// </param> 
            public static void FillTerminalTable(BaseTrie terminalTable)
            {
                terminalTable.Add(Undefined, SymbolClass.None, "Undefined");
                terminalTable.Add(Comma, SymbolClass.None, "Comma", ",");
                terminalTable.Add(LeftParen, SymbolClass.Group, "LeftParen", "(");
                terminalTable.Add(RightParen, SymbolClass.Group, "RightParen", ")");
                terminalTable.Add(Identifier, SymbolClass.Id, "Identifier");
                terminalTable.Add(IntLiteral, SymbolClass.Number, "IntLiteral");
                terminalTable.Add(ppDefine, SymbolClass.Meta, "ppDefine", "!define");
                terminalTable.Add(ppUndefine, SymbolClass.Meta, "ppUndefine", "!undefine");
                terminalTable.Add(ppIf, SymbolClass.Meta, "ppIf", "!if");
                terminalTable.Add(ppIfNot, SymbolClass.Meta, "ppIfNot", "!ifnot");
                terminalTable.Add(ppElse, SymbolClass.Meta, "ppElse", "!else");
                terminalTable.Add(ppElseIf, SymbolClass.Meta, "ppElseIf", "!elseif");
                terminalTable.Add(ppEndIf, SymbolClass.Meta, "ppEndIf", "!endif");
                terminalTable.Add(RealLiteral, SymbolClass.Number, "RealLiteral");
                terminalTable.Add(ImagLiteral, SymbolClass.Number, "ImagLiteral");
                terminalTable.Add(StringLiteral, SymbolClass.Text, "StringLiteral");
                terminalTable.Add(CharLiteral, SymbolClass.Text, "CharLiteral");
                terminalTable.Add(CommentStart, SymbolClass.Comment, "CommentStart", "/*");
                terminalTable.Add(CommentSingle, SymbolClass.Comment, "CommentSingle", "%");
                terminalTable.Add(EndOfLine, SymbolClass.None, "EndOfLine");
                terminalTable.Add(ANYSYM, SymbolClass.None, "ANYSYM");
                terminalTable.Add(EndOfInput, SymbolClass.None, "EndOfInput");
                terminalTable.Add(Operator, SymbolClass.None, "Operator");
                terminalTable.Add(Atom, SymbolClass.None, "Atom");
                terminalTable.Add(VerbatimStringStart, SymbolClass.None, "VerbatimStringStart", @"@""");
                terminalTable.Add(Dot, SymbolClass.None, "Dot");
                terminalTable.Add(Anonymous, SymbolClass.None, "Anonymous", "_");
                terminalTable.Add(CutSym, SymbolClass.None, "CutSym", "!");
                terminalTable.Add(ImpliesSym, SymbolClass.None, "ImpliesSym", ":-");
                terminalTable.Add(PromptSym, SymbolClass.None, "PromptSym", "?-");
                terminalTable.Add(DCGArrowSym, SymbolClass.None, "DCGArrowSym", "-->");
                terminalTable.Add(BuiltinCSharp, SymbolClass.None, "BuiltinCSharp", ":==");
                terminalTable.Add(LSqBracket, SymbolClass.Group, "LSqBracket", "[");
                terminalTable.Add(RSqBracket, SymbolClass.Group, "RSqBracket", "]");
                terminalTable.Add(LCuBracket, SymbolClass.Group, "LCuBracket", "{");
                terminalTable.Add(RCuBracket, SymbolClass.Group, "RCuBracket", "}");
                terminalTable.Add(VBar, SymbolClass.None, "VBar", "|");
                terminalTable.Add(OpSym, SymbolClass.None, "OpSym", "op");
                terminalTable.Add(WrapSym, SymbolClass.None, "WrapSym", "wrap");
                terminalTable.Add(BuiltinSym, SymbolClass.None, "BuiltinSym", "&builtin");
                terminalTable.Add(ProgramSym, SymbolClass.None, "ProgramSym", "&program");
                terminalTable.Add(ReadingSym, SymbolClass.None, "ReadingSym", "&reading");
                terminalTable.Add(EnsureLoaded, SymbolClass.None, "EnsureLoaded", "ensure_loaded");
                terminalTable.Add(Discontiguous, SymbolClass.None, "Discontiguous", "discontiguous");
                terminalTable.Add(StringStyle, SymbolClass.None, "StringStyle", "stringstyle");
                terminalTable.Add(AllDiscontiguous, SymbolClass.None, "AllDiscontiguous", "alldiscontiguous");
                terminalTable.Add(Module, SymbolClass.None, "Module", "module");
                terminalTable.Add(Dynamic, SymbolClass.None, "Dynamic", "dynamic");
                terminalTable.Add(ListPatternOpen, SymbolClass.Group, "ListPatternOpen", "[!");
                terminalTable.Add(ListPatternClose, SymbolClass.Group, "ListPatternClose", "!]");
                terminalTable.Add(EllipsisSym, SymbolClass.None, "EllipsisSym", "..");
                terminalTable.Add(SubtreeSym, SymbolClass.None, "SubtreeSym", @"\");
                terminalTable.Add(NegateSym, SymbolClass.None, "NegateSym", "~");
                terminalTable.Add(PlusSym, SymbolClass.None, "PlusSym", "+");
                terminalTable.Add(TimesSym, SymbolClass.None, "TimesSym", "*");
                terminalTable.Add(QuestionMark, SymbolClass.None, "QuestionMark", "?");
                terminalTable.Add(QuestionMarks, SymbolClass.None, "QuestionMarks", "??");
                terminalTable.Add(TrySym, SymbolClass.None, "TrySym", "TRY");
                terminalTable.Add(CatchSym, SymbolClass.None, "CatchSym", "CATCH");
                terminalTable.Add(WrapOpen, SymbolClass.None, "WrapOpen");
                terminalTable.Add(WrapClose, SymbolClass.None, "WrapClose");
                terminalTable.Add(AltListOpen, SymbolClass.None, "AltListOpen");
                terminalTable.Add(AltListClose, SymbolClass.None, "AltListClose");
                terminalTable.Add(Slash, SymbolClass.None, "Slash");
                terminalTable.Add(VerbatimStringLiteral, SymbolClass.None, "VerbatimStringLiteral");
            }

            #endregion Terminal definition

            #region Constructor
            public PrologParser(PrologEngine engine)
            {
                this.engine = engine;
                ps = engine.Ps;
                terminalTable = engine.terminalTable;
                opTable = engine.OpTable;
                symbol = new Symbol(this);
                streamInPrefix = "";
                streamInPreLen = 0;
                AddReservedOperators();
            }

            public PrologParser()
            {
                terminalTable = new BaseTrie(terminalCount, false);
                FillTerminalTable(terminalTable);
                symbol = new Symbol(this);
                streamInPrefix = "";
                streamInPreLen = 0;
                AddReservedOperators();
            }
            #endregion constructor

            #region NextSymbol, GetSymbol
            /// <summary> 
            /// checks if a given symbol is valid based on its ID and terminal set. If it's not, 
            /// it generates an error message and returns true to indicate an error. 
            /// </summary> 
            /// <param name="followers"> 
            /// set of terminals that are being followed by the parser, and is used to determine 
            /// which symbols the parser expects to see next. 
            /// </param> 
            /// <param name="done"> 
            /// whether the symbol has been processed or not, and is used to determine when to 
            /// stop searching for a matching symbol. 
            /// </param> 
            /// <param name="genXCPN"> 
            /// whether the symbol table should include the XCPN (eXtra C++ Plugin) symbols or not. 
            /// </param> 
            /// <returns> 
            /// a error message indicating an unexpected symbol encountered during parsing. 
            /// </returns> 
            protected override bool GetSymbol(TerminalSet followers, bool done, bool genXCPN)
            {
                string s;

                if (symbol.IsProcessed) NextSymbol();

                symbol.SetProcessed(done);
                if (parseAnyText || followers.IsEmpty()) return true;

                if (syntaxErrorStat) return false;

                if (symbol.TerminalId == ANYSYM || followers.Contains(symbol.TerminalId)) return true;

                switch (symbol.TerminalId)
                {
                    case EndOfLine:
                        if (seeEndOfLine) s = "<EndOfLine>"; else goto default;
                        s = "<EndOfLine>";
                        break;
                    case EndOfInput:
                        s = "<EndOfInput>";
                        break;
                    default:
                        s = String.Format("\"{0}\"", symbol.ToString());
                        break;
                }

                s = String.Format("*** Unexpected symbol: {0}{1}*** Expected one of: {2}", s,
                                   Environment.NewLine, terminalTable.TerminalImageSet(followers));
                if (genXCPN)
                    SyntaxError = s;
                else
                    errorMessage = s;

                return true;
            }
            #endregion NextSymbol, GetSymbol

            #region PARSER PROCEDURES
            public override void RootCall()
            {
                PrologCode(new TerminalSet(terminalCount, EndOfInput));
            }


            public override void Delegates()
            {

            }


            #region PrologCode
            /// <summary> 
            /// processes a term set and performs various actions based on the terminals present 
            /// in it, such as defining operators and atoms, querying the term set, and terminating 
            /// the process. 
            /// </summary> 
            /// <param name="_TS"> 
            /// terminal set of symbols passed to the `PrologCode` function, which is used to 
            /// determine the type of symbol to be processed and the corresponding action to take. 
            /// </param> 
            private void PrologCode(TerminalSet _TS)
            {
                SetCommaAsSeparator(false); // Comma-role only if comma is separating arguments
                terminalTable[OP] = OpSym;
                terminalTable[WRAP] = WrapSym;
                inQueryMode = false;
                try
                {
                    SeeEndOfLine = false;
                    terminalTable[ELLIPSIS] = Operator;
                    terminalTable[SUBTREE] = Operator;
                    terminalTable[STRINGSTYLE] = Atom;
                    if (terminalTable[NEGATE] == NegateSym) terminalTable[NEGATE] = Atom;
                    GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                         Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, OpSym, WrapSym,
                                                         BuiltinSym, ProgramSym, ReadingSym, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                                         AltListOpen, AltListClose, VerbatimStringLiteral), false, true);
                    if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                           Anonymous, CutSym, LSqBracket, LCuBracket, OpSym, WrapSym, BuiltinSym, ProgramSym, ReadingSym,
                                           ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral))
                    {
                        GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                                   Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, OpSym, WrapSym,
                                                                   BuiltinSym, ProgramSym, ReadingSym, ListPatternOpen, TrySym, WrapOpen,
                                                                   WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral), false, true);
                        if (symbol.TerminalId == BuiltinSym)
                        {
                            symbol.SetProcessed();
                            Initialize();
                            Predefineds(_TS);
                        }
                        else if (symbol.TerminalId == ProgramSym)
                        {
                            symbol.SetProcessed();
                            Initialize();
                            Program(_TS);
                        }
                        else if (symbol.TerminalId == ReadingSym)
                        {
                            symbol.SetProcessed();
                            PrologTerm(new TerminalSet(terminalCount, Dot), out readTerm);
                            GetSymbol(new TerminalSet(terminalCount, Dot), true, true);
                        }
                        else
                        {
                            engine.EraseVariables();
                            inQueryMode = true;
                            GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral,
                                                                       StringLiteral, Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket,
                                                                       OpSym, WrapSym, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                                                       AltListOpen, AltListClose, VerbatimStringLiteral), false, true);
                            if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                                   Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                                   AltListOpen, AltListClose, VerbatimStringLiteral))
                            {
                                terminalTable[OP] = Atom;
                                terminalTable[WRAP] = Atom;
                                SetReservedOperators(true);
                                Query(new TerminalSet(terminalCount, Dot), out queryNode);
                            }
                            else if (symbol.TerminalId == OpSym)
                            {
                                OpDefinition(new TerminalSet(terminalCount, Dot), true);
                                queryNode = null;
                            }
                            else
                            {
                                WrapDefinition(new TerminalSet(terminalCount, Dot));
                                queryNode = null;
                            }
                            GetSymbol(new TerminalSet(terminalCount, Dot), true, true);
                        }
                    }
                }
                finally { Terminate(); }
            }
            #endregion

            #region Program
            /// <summary> 
            /// takes a `TerminalSet` and repeatedly reads symbols from the input until it encounters 
            /// a specific symbol, then builds a clause node based on the read symbols and updates 
            /// a boolean variable indicating if a clause was found. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet, which is used to gather symbols from the input stream and create a 
            /// ClauseNode object in the while loop. 
            /// </param> 
            private void Program(TerminalSet _TS)
            {
                bool firstReport = true;
                while (true)
                {
                    GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                         Operator, Atom, Anonymous, CutSym, ImpliesSym, PromptSym, LSqBracket, LCuBracket,
                                                         ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                         VerbatimStringLiteral), false, true);
                    if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                           Anonymous, CutSym, ImpliesSym, PromptSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym,
                                           WrapOpen, WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral))
                    {
                        ClauseNode(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                              Operator, Atom, Anonymous, CutSym, ImpliesSym, PromptSym, LSqBracket,
                                                              LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen,
                                                              AltListClose, VerbatimStringLiteral), ref firstReport);
                    }
                    else
                        break;
                }
            }
            #endregion

            #region ClauseNode
            /// <summary> 
            /// parses Prolog clauses and handles various directives, such as `module`, `dynamic`, 
            /// and `discontiguous`. It also implements the semantics of these directives, such 
            /// as loading modules, defining dynamic predicates, and wrapping definitions. 
            /// </summary> 
            /// <param name="_TS"> 
            /// 1-based index of the current terminal in the `GetSymbol` function's terminal table, 
            /// which is used to access the corresponding symbol in the `terminalTable` map. 
            /// </param> 
            /// <param name="bool"> 
            /// whether the directive is inside an inline definition and should be processed as such. 
            /// </param> 
            private void ClauseNode(TerminalSet _TS, ref bool firstReport)
            {
                BaseTerm head;
                TermNode body = null;
                ClauseNode c;
                engine.EraseVariables();
                int lineNo = symbol.LineNo;
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                           Operator, Atom, Anonymous, CutSym, ImpliesSym, PromptSym, LSqBracket,
                                                           LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen,
                                                           AltListClose, VerbatimStringLiteral), false, true);
                if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                       Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                       AltListOpen, AltListClose, VerbatimStringLiteral))
                {
                    PrologTerm(new TerminalSet(terminalCount, Dot, ImpliesSym, DCGArrowSym), out head);
                    if (!head.IsCallable)
                        IO.Error("Illegal predicate head: {0}", head.ToString());
                    if (engine.predTable.Predefineds.Contains(head.Key))
                        IO.Error("Predefined predicate or operator '{0}' cannot be redefined.", head.FunctorToString);
                    GetSymbol(new TerminalSet(terminalCount, Dot, ImpliesSym, DCGArrowSym), false, true);
                    if (symbol.IsMemberOf(ImpliesSym, DCGArrowSym))
                    {
                        GetSymbol(new TerminalSet(terminalCount, ImpliesSym, DCGArrowSym), false, true);
                        if (symbol.TerminalId == ImpliesSym)
                        {
                            symbol.SetProcessed();
                            Query(new TerminalSet(terminalCount, Dot), out body);
                        }
                        else
                        {
                            symbol.SetProcessed();
                            BaseTerm t;
                            readingDcgClause = true;
                            PrologTerm(new TerminalSet(terminalCount, Dot), out t);
                            readingDcgClause = false;
                            body = t.ToDCG(ref head);
                        }
                    }
                    c = new ClauseNode(head, body);

                    if (engine.showSingletonWarnings)
                    {
                        engine.ReportSingletons(c, lineNo - 1, ref firstReport);
                    }
                    ps.AddClause(c);
                }
                else if (symbol.TerminalId == PromptSym)
                {
                    symbol.SetProcessed();
                    bool m = inQueryMode;
                    bool o = isReservedOperatorSetting;
                    try
                    {
                        inQueryMode = true;
                        SetReservedOperators(true);
                        Query(new TerminalSet(terminalCount, Dot), out queryNode);
                        IO.Error("'?-' querymode in file not yet supported");
                    }
                    finally
                    {
                        inQueryMode = m;
                        SetReservedOperators(o);
                    }
                }
                else
                {
                    symbol.SetProcessed();
                    terminalTable[STRINGSTYLE] = StringStyle;
                    terminalTable.Add(Module, "Module", "module");
                    terminalTable.Add(Discontiguous, "Discontiguous", "discontiguous");
                    terminalTable.Add(Dynamic, "Dynamic", "dynamic");
                    try
                    {
                        GetSymbol(new TerminalSet(terminalCount, Atom, LSqBracket, OpSym, WrapSym, EnsureLoaded, Discontiguous, StringStyle,
                                                                   AllDiscontiguous, Module, Dynamic), false, true);
                        if (symbol.TerminalId == OpSym)
                        {
                            OpDefinition(new TerminalSet(terminalCount, Dot), true);
                        }
                        else if (symbol.TerminalId == Dynamic)
                        {
                            DynamicDirective(new TerminalSet(terminalCount, Dot));
                        }
                        else if (symbol.TerminalId == WrapSym)
                        {
                            WrapDefinition(new TerminalSet(terminalCount, Dot));
                        }
                        else if (symbol.TerminalId == EnsureLoaded)
                        {
                            symbol.SetProcessed();
                            GetSymbol(new TerminalSet(terminalCount, LeftParen), true, true);
                            GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                            if (symbol.TerminalId == Atom)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            string fileName = Utils.ExtendedFileName(symbol.ToString().ToLower(), ".pl");
                            if (Globals.ConsultedFiles[fileName] == null)
                            {
                                ps.Consult(fileName);
                                Globals.ConsultedFiles[fileName] = true;
                            }
                            GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                        }
                        else if (symbol.TerminalId == Discontiguous)
                        {
                            symbol.SetProcessed();
                            BaseTerm t;
                            PrologTerm(new TerminalSet(terminalCount, Dot), out t);
                            ps.SetDiscontiguous(t);
                        }
                        else if (symbol.TerminalId == StringStyle)
                        {
                            symbol.SetProcessed();
                            BaseTerm t;
                            PrologTerm(new TerminalSet(terminalCount, Dot), out t);
                            engine.SetStringStyle(t);
                        }
                        else if (symbol.TerminalId == AllDiscontiguous)
                        {
                            symbol.SetProcessed();
                            ps.SetDiscontiguous(true);
                        }
                        else if (symbol.TerminalId == Module)
                        {
                            symbol.SetProcessed();
                            GetSymbol(new TerminalSet(terminalCount, LeftParen), true, true);
                            try
                            {
                                SetCommaAsSeparator(true);
                                GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                                if (symbol.TerminalId == Atom)
                                {
                                    symbol.SetProcessed();
                                }
                                else
                                {
                                    symbol.SetProcessed();
                                }
                                ps.SetModuleName(symbol.ToString());
                                IO.Warning("line {0} -- :- 'module' directive not implemented -- ignored", symbol.LineNo);
                                GetSymbol(new TerminalSet(terminalCount, Comma), true, true);
                            }
                            finally
                            {
                                SetCommaAsSeparator(false);
                            }
                            BaseTerm t;
                            PrologTerm(new TerminalSet(terminalCount, RightParen), out t);
                            GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                        }
                        else if (symbol.TerminalId == LSqBracket)
                        {
                            symbol.SetProcessed();
                            int lines = 0;
                            int files = 0;
                            try
                            {
                                while (true)
                                {
                                    GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                                    if (symbol.TerminalId == Atom)
                                    {
                                        symbol.SetProcessed();
                                    }
                                    else
                                    {
                                        symbol.SetProcessed();
                                    }
                                    string fileName = Utils.FileNameFromSymbol(symbol.ToString(), ".pl");
                                    SetCommaAsSeparator(false);
                                    lines += ps.Consult(fileName);
                                    files++;
                                    SetCommaAsSeparator(true);
                                    GetSymbol(new TerminalSet(terminalCount, Comma, RSqBracket), false, true);
                                    if (symbol.TerminalId == Comma)
                                    {
                                        symbol.SetProcessed();
                                    }
                                    else
                                        break;
                                }
                                if (files > 1) IO.Message("Grand total is {0} lines", lines);
                            }
                            finally
                            {
                                SetCommaAsSeparator(false);
                            }
                            GetSymbol(new TerminalSet(terminalCount, RSqBracket), true, true);
                        }
                        else
                        {
                            SimpleDirective(new TerminalSet(terminalCount, Dot));
                        }
                    }
                    finally
                    {
                        terminalTable.Remove("module");
                        terminalTable.Remove("discontiguous");
                        terminalTable.Remove("dynamic");
                        terminalTable[ELLIPSIS] = Atom;
                        terminalTable[STRINGSTYLE] = Atom;
                        terminalTable[SLASH] = Operator;
                        terminalTable[SUBTREE] = Operator;
                    }
                }
                GetSymbol(new TerminalSet(terminalCount, Dot), true, true);
            }
            #endregion

            #region DynamicDirective
            /// <summary> 
            /// processes a directive and performs operations based on the symbol's type, including 
            /// setting processed status, getting symbols, and ignoring certain directives. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet containing the symbols to be processed by the `DynamicDirective` function. 
            /// </param> 
            private void DynamicDirective(TerminalSet _TS)
            {
                GetSymbol(new TerminalSet(terminalCount, Dynamic), true, true);
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Operator, Atom), false, true);
                if (symbol.IsMemberOf(Operator, Atom))
                {
                    GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                    if (symbol.TerminalId == Atom)
                    {
                        symbol.SetProcessed();
                    }
                    else
                    {
                        symbol.SetProcessed();
                    }
                }
                else
                {
                    symbol.SetProcessed();
                    GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                    if (symbol.TerminalId == Atom)
                    {
                        symbol.SetProcessed();
                    }
                    else
                    {
                        symbol.SetProcessed();
                    }
                    GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                }
                string name = symbol.ToString();
                int saveSlash = terminalTable[SLASH];
                int arity;
                try
                {
                    terminalTable[SLASH] = Slash;
                    GetSymbol(new TerminalSet(terminalCount, Slash), true, true);
                    GetSymbol(new TerminalSet(terminalCount, IntLiteral), true, true);
                    arity = symbol.ToInt();
                    IO.Warning("line {0} -- :- 'dynamic' directive not implemented -- ignored", symbol.LineNo);
                }
                finally
                {
                    terminalTable[SLASH] = saveSlash;
                }
            }
            #endregion

            #region SimpleDirective
            /// <summary> 
            /// processes a simple directive (a sequence of symbols) and passes it to the 
            /// `ps.HandleSimpleDirective()` method for further processing. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet containing the current symbol being processed, which is used to determine 
            /// the appropriate action to take based on the symbol's type and context. 
            /// </param> 
            private void SimpleDirective(TerminalSet _TS)
            {
                GetSymbol(new TerminalSet(terminalCount, Atom), true, true);
                string directive = symbol.ToString();
                bool spaceAfter = symbol.IsFollowedByLayoutChar;
                string argument = null;
                int arity = -1;
                int saveSlash = terminalTable[SLASH];
                try
                {
                    terminalTable[SLASH] = Slash;
                    GetSymbol(_TS.Union(terminalCount, LeftParen), false, true);
                    if (symbol.TerminalId == LeftParen)
                    {
                        symbol.SetProcessed();
                        GetSymbol(new TerminalSet(terminalCount, IntLiteral, StringLiteral, Operator, Atom), false, true);
                        if (symbol.IsMemberOf(Operator, Atom))
                        {
                            if (spaceAfter)
                                IO.Error("Illegal space between directive '{0}' and left parenthesis", directive);
                            GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                            if (symbol.TerminalId == Atom)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            argument = symbol.ToString();
                            GetSymbol(new TerminalSet(terminalCount, RightParen, Slash), false, true);
                            if (symbol.TerminalId == Slash)
                            {
                                symbol.SetProcessed();
                                GetSymbol(new TerminalSet(terminalCount, IntLiteral), true, true);
                                arity = symbol.ToInt();
                            }
                        }
                        else
                        {
                            GetSymbol(new TerminalSet(terminalCount, IntLiteral, StringLiteral), false, true);
                            if (symbol.TerminalId == StringLiteral)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            argument = symbol.ToString().Dequoted();
                        }
                        GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                    }
                    ps.HandleSimpleDirective(this, directive, argument, arity);
                }
                finally
                {
                    terminalTable[SLASH] = saveSlash;
                }
            }
            #endregion

            #region OpDefinition
            /// <summary> 
            /// defines a Prolog operator by parsing its symbolic representation and adding or 
            /// removing it from the operator set based on the user's input. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet containing the operator to be processed, which is passed into the 
            /// function for further processing. 
            /// </param> 
            /// <param name="user"> 
            /// user-defined symbol, which is used to determine whether to remove or add an operator 
            /// to the operational definition. 
            /// </param> 
            private void OpDefinition(TerminalSet _TS, bool user)
            {
                string name;
                string assoc;
                try
                {
                    SetCommaAsSeparator(true);
                    GetSymbol(new TerminalSet(terminalCount, OpSym), true, true);
                    int prec;
                    GetSymbol(new TerminalSet(terminalCount, LeftParen), true, true);
                    GetSymbol(new TerminalSet(terminalCount, IntLiteral, CutSym), false, true);
                    if (symbol.TerminalId == IntLiteral)
                    {
                        symbol.SetProcessed();
                        prec = symbol.ToInt();
                    }
                    else
                    {
                        symbol.SetProcessed();
                        prec = -1;
                    }
                    GetSymbol(new TerminalSet(terminalCount, Comma), true, true);
                    GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                    if (symbol.TerminalId == Atom)
                    {
                        symbol.SetProcessed();
                    }
                    else
                    {
                        symbol.SetProcessed();
                    }
                    assoc = symbol.ToString();
                    GetSymbol(new TerminalSet(terminalCount, Comma), true, true);
                    GetSymbol(new TerminalSet(terminalCount, LeftParen, Operator, Atom, LSqBracket, OpSym, WrapSym, EnsureLoaded,
                                                               Discontiguous, StringStyle, AllDiscontiguous, Module, Dynamic, WrapOpen,
                                                               WrapClose), false, true);
                    if (symbol.TerminalId == LSqBracket)
                    {
                        symbol.SetProcessed();
                        while (true)
                        {
                            PotentialOpName(new TerminalSet(terminalCount, Comma, RSqBracket), out name);
                            if (prec == -1)
                                RemovePrologOperator(assoc, name, user);
                            else
                                AddPrologOperator(prec, assoc, name, user);
                            GetSymbol(new TerminalSet(terminalCount, Comma, RSqBracket), false, true);
                            if (symbol.TerminalId == Comma)
                            {
                                symbol.SetProcessed();
                            }
                            else
                                break;
                        }
                        GetSymbol(new TerminalSet(terminalCount, RSqBracket), true, true);
                    }
                    else
                    {
                        PotentialOpName(new TerminalSet(terminalCount, RightParen), out name);
                        if (prec == -1)
                            RemovePrologOperator(assoc, name, user);
                        else
                            AddPrologOperator(prec, assoc, name, user);
                    }
                    GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                }
                finally
                {
                    SetCommaAsSeparator(false);
                }
            }
            #endregion

            #region WrapDefinition
            /// <summary> 
            /// wraps a symbol's definition with a pair of brackets, based on the symbol's type 
            /// and any potential operator name. It also handles cases where the symbol is a comma 
            /// or right paren. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet object that contains the terminals to be wrapped. 
            /// </param> 
            private void WrapDefinition(TerminalSet _TS)
            {
                // wrapClose is set to the reverse of wrapOpen if only one argument is supplied.
                string wrapOpen;
                string wrapClose = null;
                bool useAsList = false;
                try
                {
                    SetCommaAsSeparator(true);
                    GetSymbol(new TerminalSet(terminalCount, WrapSym), true, true);
                    GetSymbol(new TerminalSet(terminalCount, LeftParen), true, true);
                    PotentialOpName(new TerminalSet(terminalCount, Comma, RightParen), out wrapOpen);
                    GetSymbol(new TerminalSet(terminalCount, Comma, RightParen), false, true);
                    if (symbol.TerminalId == Comma)
                    {
                        symbol.SetProcessed();
                        GetSymbol(new TerminalSet(terminalCount, LeftParen, RightParen, Operator, Atom, VBar, OpSym, WrapSym, EnsureLoaded,
                                                                   Discontiguous, StringStyle, AllDiscontiguous, Module, Dynamic, WrapOpen,
                                                                   WrapClose), false, true);
                        if (symbol.IsMemberOf(LeftParen, Operator, Atom, VBar, OpSym, WrapSym, EnsureLoaded, Discontiguous, StringStyle,
                                               AllDiscontiguous, Module, Dynamic, WrapOpen, WrapClose))
                        {
                            GetSymbol(new TerminalSet(terminalCount, LeftParen, Operator, Atom, VBar, OpSym, WrapSym, EnsureLoaded,
                                                                       Discontiguous, StringStyle, AllDiscontiguous, Module, Dynamic, WrapOpen,
                                                                       WrapClose), false, true);
                            if (symbol.TerminalId == VBar)
                            {
                                symbol.SetProcessed();
                                useAsList = true;
                                GetSymbol(new TerminalSet(terminalCount, Comma, RightParen), false, true);
                                if (symbol.TerminalId == Comma)
                                {
                                    symbol.SetProcessed();
                                    PotentialOpName(new TerminalSet(terminalCount, RightParen), out wrapClose);
                                    wrapClose = symbol.ToString();
                                }
                            }
                            else
                            {
                                PotentialOpName(new TerminalSet(terminalCount, RightParen), out wrapClose);
                                wrapClose = symbol.ToString();
                            }
                        }
                    }
                    if (wrapClose == null) wrapClose = wrapOpen.Mirror();
                    GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                    AddBracketPair(wrapOpen, wrapClose, useAsList);
                }
                finally
                {
                    SetCommaAsSeparator(false);
                }
            }
            #endregion

            #region PotentialOpName
            /// <summary> 
            /// determines whether a symbol is an operator, atom, or reserved word, and sets its 
            /// processed status accordingly. If it is not, it recursively calls itself on the 
            /// right parenthesis symbol. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet object that contains the symbols to be processed by the function. 
            /// </param> 
            /// <param name="string"> 
            /// name of the resulting symbol and is assigned the value returned by the function 
            /// after processing the given terminal set. 
            /// </param> 
            private void PotentialOpName(TerminalSet _TS, out string name)
            {
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Operator, Atom, OpSym, WrapSym, EnsureLoaded, Discontiguous,
                                                           StringStyle, AllDiscontiguous, Module, Dynamic, WrapOpen, WrapClose), false,
                           true);
                if (symbol.IsMemberOf(Operator, Atom, OpSym, WrapSym, EnsureLoaded, Discontiguous, StringStyle, AllDiscontiguous,
                                       Module, Dynamic, WrapOpen, WrapClose))
                {
                    GetSymbol(new TerminalSet(terminalCount, Operator, Atom, OpSym, WrapSym, EnsureLoaded, Discontiguous, StringStyle,
                                                               AllDiscontiguous, Module, Dynamic, WrapOpen, WrapClose), false, true);
                    if (symbol.TerminalId == Atom)
                    {
                        symbol.SetProcessed();
                    }
                    else if (symbol.TerminalId == Operator)
                    {
                        symbol.SetProcessed();
                    }
                    else if (symbol.TerminalId == WrapOpen)
                    {
                        symbol.SetProcessed();
                    }
                    else if (symbol.TerminalId == WrapClose)
                    {
                        symbol.SetProcessed();
                    }
                    else
                    {
                        ReservedWord(_TS);
                    }
                    name = symbol.ToString();
                }
                else
                {
                    symbol.SetProcessed();
                    PotentialOpName(new TerminalSet(terminalCount, RightParen), out name);
                    GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                }
            }
            #endregion

            #region ReservedWord
            /// <summary> 
            /// processes a given symbol based on its terminal ID, setting it to "processed" if 
            /// it matches a specific value. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet object that contains the current terminal being processed, which is 
            /// passed to the GetSymbol method to retrieve the symbol associated with the terminal. 
            /// </param> 
            private void ReservedWord(TerminalSet _TS)
            {
                GetSymbol(new TerminalSet(terminalCount, OpSym, WrapSym, EnsureLoaded, Discontiguous, StringStyle, AllDiscontiguous,
                                                           Module, Dynamic), false, true);
                if (symbol.TerminalId == OpSym)
                {
                    symbol.SetProcessed();
                }
                else if (symbol.TerminalId == WrapSym)
                {
                    symbol.SetProcessed();
                }
                else if (symbol.TerminalId == EnsureLoaded)
                {
                    symbol.SetProcessed();
                }
                else if (symbol.TerminalId == Discontiguous)
                {
                    symbol.SetProcessed();
                }
                else if (symbol.TerminalId == StringStyle)
                {
                    symbol.SetProcessed();
                }
                else if (symbol.TerminalId == AllDiscontiguous)
                {
                    symbol.SetProcessed();
                }
                else if (symbol.TerminalId == Module)
                {
                    symbol.SetProcessed();
                }
                else
                {
                    symbol.SetProcessed();
                }
            }
            #endregion

            #region Predefineds
            /// <summary> 
            /// iterates through a given set of terminals and their associated symbols, applying 
            /// them to a symbol if they are present in the set. 
            /// </summary> 
            /// <param name="_TS"> 
            /// terminal set that the function is operating on, and it is used to filter out 
            /// non-terminals during the generation of documentation. 
            /// </param> 
            private void Predefineds(TerminalSet _TS)
            {
                do
                {
                    Predefined(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                          Operator, Atom, Anonymous, CutSym, ImpliesSym, LSqBracket, LCuBracket,
                                                          ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                          VerbatimStringLiteral));
                    GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                         Operator, Atom, Anonymous, CutSym, ImpliesSym, LSqBracket, LCuBracket,
                                                         ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                         VerbatimStringLiteral), false, true);
                } while (!(_TS.Contains(symbol.TerminalId)));
            }
            #endregion

            #region Predefined
            /// <summary> 
            /// processes a predefined clause and adds it to a list of clauses for further analysis. 
            /// It first erases variables, then retrieves the symbol from the input set and sets 
            /// its processed status. Based on the symbol's terminal ID, it either retrieves the 
            /// next symbol or adds a predefined clause to the list. 
            /// </summary> 
            /// <param name="_TS"> 
            /// 3-address code to be parsed and processed, which is passed to the function as an 
            /// argument to facilitate the execution of predefined directives. 
            /// </param> 
            private void Predefined(TerminalSet _TS)
            {
                BaseTerm head;
                bool opt = true;
                TermNode body = null;
                engine.EraseVariables();
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                           Operator, Atom, Anonymous, CutSym, ImpliesSym, LSqBracket, LCuBracket,
                                                           ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                           VerbatimStringLiteral), false, true);
                if (symbol.TerminalId == ImpliesSym)
                {
                    symbol.SetProcessed();
                    GetSymbol(new TerminalSet(terminalCount, Atom, OpSym, WrapSym), false, true);
                    if (symbol.TerminalId == OpSym)
                    {
                        OpDefinition(new TerminalSet(terminalCount, Dot), false);
                    }
                    else if (symbol.TerminalId == WrapSym)
                    {
                        WrapDefinition(new TerminalSet(terminalCount, Dot));
                    }
                    else
                    {
                        SimpleDirective(new TerminalSet(terminalCount, Dot));
                    }
                }
                else
                {
                    PrologTerm(new TerminalSet(terminalCount, Dot, ImpliesSym, DCGArrowSym, BuiltinCSharp), out head);
                    GetSymbol(new TerminalSet(terminalCount, Dot, ImpliesSym, DCGArrowSym, BuiltinCSharp), false, true);
                    if (symbol.IsMemberOf(ImpliesSym, DCGArrowSym, BuiltinCSharp))
                    {
                        GetSymbol(new TerminalSet(terminalCount, ImpliesSym, DCGArrowSym, BuiltinCSharp), false, true);
                        if (symbol.TerminalId == BuiltinCSharp)
                        {
                            symbol.SetProcessed();
                            GetSymbol(new TerminalSet(terminalCount, Operator, Atom), false, true);
                            if (symbol.TerminalId == Atom)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            ps.AddPredefined(new ClauseNode(head, new TermNode(symbol.ToString())));
                            opt = false;
                        }
                        else if (symbol.TerminalId == ImpliesSym)
                        {
                            symbol.SetProcessed();
                            Query(new TerminalSet(terminalCount, Dot), out body);
                            ps.AddPredefined(new ClauseNode(head, body));
                            opt = false;
                        }
                        else
                        {
                            symbol.SetProcessed();
                            BaseTerm term;
                            readingDcgClause = true;
                            PrologTerm(new TerminalSet(terminalCount, Dot), out term);
                            readingDcgClause = false;
                            body = term.ToDCG(ref head);
                            ps.AddPredefined(new ClauseNode(head, body));
                            opt = false;
                        }
                    }
                    if (opt) ps.AddPredefined(new ClauseNode(head, null));
                }
                GetSymbol(new TerminalSet(terminalCount, Dot), true, true);
            }
            #endregion

            #region Query
            /// <summary> 
            /// takes a `TerminalSet` and an output parameter `body`, and returns a list of goal 
            /// nodes representing the subgoals that can be derived from the input terminal set. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TermSet that contains the terms to be processed by the function, which then generates 
            /// high-quality documentation for the code. 
            /// </param> 
            /// <param name="TermNode"> 
            /// term being processed by the `Query` function. 
            /// </param> 
            private void Query(TerminalSet _TS, out TermNode body)
            {
                BaseTerm t = null;
                PrologTerm(_TS, out t);
                body = t.ToGoalList();
            }
            #endregion

            #region PrologTerm
            /// <summary> 
            /// modifies a given terminal set and outputs its base term after separating commas 
            /// with a custom value. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet that contains the term being processed by the PrologTermEx function. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// term that is generated by the `PrologTermEx()` method and returned as an output parameter. 
            /// </param> 
            private void PrologTerm(TerminalSet _TS, out BaseTerm t)
            {
                bool saveStatus = SetCommaAsSeparator(false);
                PrologTermEx(_TS, out t);
                SetCommaAsSeparator(saveStatus);
            }
            #endregion

            #region PrologTermEx
            /// <summary> 
            /// parses a term sequence and constructs an equivalent term tree, handling various 
            /// Prolog syntax features such as symbols, brackets, lists, and verbs. 
            /// </summary> 
            /// <param name="_TS"> 
            /// set of terminal symbols that the `TokenSequenceToTerm` function is currently 
            /// processing, and it is used to determine which symbol types are allowed at each 
            /// step of the parsing process. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// 0-based index of the first symbol in the input sequence, which is used to determine 
            /// the correct token sequence to return. 
            /// </param> 
            private void PrologTermEx(TerminalSet _TS, out BaseTerm t)
            {
                string functor;
                OpDescrTriplet triplet;
                bool spaceAfter;
                TokenSeqToTerm tokenSeqToTerm = new TokenSeqToTerm(opTable);
                do
                {
                    triplet = null;
                    BaseTerm[] args = null;
                    GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                               Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                               TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                               VerbatimStringLiteral), false, true);
                    if (symbol.TerminalId == Operator)
                    {
                        symbol.SetProcessed();
                        spaceAfter = symbol.IsFollowedByLayoutChar;
                        triplet = symbol.Payload;
                        bool commaAsSeparator = !spaceAfter && tokenSeqToTerm.PrevTokenWasOperator;
                        GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                             Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                             TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral),
                                   false, true);
                        if (symbol.TerminalId == LeftParen)
                        {
                            symbol.SetProcessed();
                            ArgumentList(new TerminalSet(terminalCount, RightParen), out args, commaAsSeparator);
                            GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                        }
                        if (args == null)
                            tokenSeqToTerm.Add(triplet); // single operator
                        else if (commaAsSeparator)
                            tokenSeqToTerm.AddOperatorFunctor(triplet, args); // operator as functor with >= 1 args
                        else
                        {
                            tokenSeqToTerm.Add(triplet);
                            tokenSeqToTerm.Add(args[0]);
                        }
                    }
                    else
                    {
                        GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral,
                                                                   StringLiteral, Atom, Anonymous, CutSym, LSqBracket, LCuBracket,
                                                                   ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                                   VerbatimStringLiteral), false, true);
                        if (symbol.TerminalId == Atom)
                        {
                            symbol.SetProcessed();
                            functor = symbol.ToString();
                            spaceAfter = symbol.IsFollowedByLayoutChar;
                            GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                                 Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                                 TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                                 VerbatimStringLiteral), false, true);
                            if (symbol.TerminalId == LeftParen)
                            {
                                symbol.SetProcessed();
                                ArgumentList(new TerminalSet(terminalCount, RightParen), out args, true);
                                GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                            }
                            tokenSeqToTerm.AddFunctorTerm(functor, spaceAfter, args);
                        }
                        else if (symbol.TerminalId == LeftParen)
                        {
                            symbol.SetProcessed();
                            bool saveStatus = SetCommaAsSeparator(false);
                            PrologTermEx(new TerminalSet(terminalCount, RightParen), out t);
                            SetCommaAsSeparator(saveStatus);
                            tokenSeqToTerm.Add(t);
                            GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                        }
                        else if (symbol.TerminalId == Identifier)
                        {
                            GetIdentifier(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral,
                                                                     StringLiteral, Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket,
                                                                     ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                                     VerbatimStringLiteral), out t);
                            tokenSeqToTerm.Add(t);
                        }
                        else if (symbol.TerminalId == Anonymous)
                        {
                            symbol.SetProcessed();
                            tokenSeqToTerm.Add(new AnonymousVariable());
                        }
                        else if (symbol.TerminalId == CutSym)
                        {
                            symbol.SetProcessed();
                            tokenSeqToTerm.Add(new Cut(0));
                        }
                        else if (symbol.TerminalId == AltListOpen)
                        {
                            AltList(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                               Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                               TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral),
                                    out t);
                            tokenSeqToTerm.Add(t);
                        }
                        else if (symbol.TerminalId == LSqBracket)
                        {
                            List(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                            Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                            TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral),
                                 out t);
                            tokenSeqToTerm.Add(t);
                        }
                        else if (symbol.IsMemberOf(IntLiteral, RealLiteral))
                        {
                            GetSymbol(new TerminalSet(terminalCount, IntLiteral, RealLiteral), false, true);
                            if (symbol.TerminalId == IntLiteral)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            tokenSeqToTerm.Add(new DecimalTerm(symbol.ToDecimal()));
                        }
                        else if (symbol.TerminalId == ImagLiteral)
                        {
                            symbol.SetProcessed();
                            tokenSeqToTerm.Add(new ComplexTerm(0, symbol.ToImaginary()));
                        }
                        else if (symbol.TerminalId == StringLiteral)
                        {
                            symbol.SetProcessed();
                            string s = symbol.ToUnquoted();
                            s = ConfigSettings.ResolveEscapes ? s.Unescaped() : s.Replace("\"\"", "\"");
                            tokenSeqToTerm.Add(engine.NewIsoOrCsStringTerm(s));
                        }
                        else if (symbol.TerminalId == VerbatimStringLiteral)
                        {
                            symbol.SetProcessed();
                            string s = symbol.ToUnquoted();
                            s = s.Replace("\"\"", "\"");
                            tokenSeqToTerm.Add(engine.NewIsoOrCsStringTerm(s));
                        }
                        else if (symbol.TerminalId == LCuBracket)
                        {
                            DCGBracketList(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral,
                                                                      StringLiteral, Operator, Atom, Anonymous, CutSym, LSqBracket,
                                                                      LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen,
                                                                      AltListClose, VerbatimStringLiteral), out t);
                            tokenSeqToTerm.Add(t);
                        }
                        else if (symbol.TerminalId == WrapOpen)
                        {
                            symbol.SetProcessed();
                            string wrapOpen = symbol.ToString();
                            GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                                 Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                                 TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                                 VerbatimStringLiteral), false, true);
                            if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                                   Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                                   AltListOpen, AltListClose, VerbatimStringLiteral))
                            {
                                string wrapClose = engine.WrapTable.FindCloseBracket(wrapOpen);
                                bool saveStatus = SetCommaAsSeparator(false);
                                ArgumentList(new TerminalSet(terminalCount, WrapClose), out args, true);
                                SetCommaAsSeparator(saveStatus);
                                GetSymbol(new TerminalSet(terminalCount, WrapClose), true, true);
                                if (symbol.ToString() != wrapClose)
                                    IO.Error("Illegal wrapper close token: got '{0}' expected '{1}'",
                                               symbol.ToString(), wrapClose);
                                tokenSeqToTerm.Add(new WrapperTerm(wrapOpen, wrapClose, args));
                            }
                            if (args == null) tokenSeqToTerm.Add(new AtomTerm(wrapOpen.ToAtom()));
                        }
                        else if (symbol.IsMemberOf(WrapClose, AltListClose))
                        {
                            GetSymbol(new TerminalSet(terminalCount, WrapClose, AltListClose), false, true);
                            if (symbol.TerminalId == WrapClose)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            string orphanCloseBracket = symbol.ToString();
                            tokenSeqToTerm.Add(new AtomTerm(orphanCloseBracket.ToAtom()));
                        }
                        else if (symbol.TerminalId == ListPatternOpen)
                        {
                            symbol.SetProcessed();
                            ListPatternMembers(new TerminalSet(terminalCount, ListPatternClose), out t);
                            GetSymbol(new TerminalSet(terminalCount, ListPatternClose), true, true);
                            tokenSeqToTerm.Add(t);
                        }
                        else
                        {
                            TryCatchClause(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral,
                                                                      StringLiteral, Operator, Atom, Anonymous, CutSym, LSqBracket,
                                                                      LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen,
                                                                      AltListClose, VerbatimStringLiteral), tokenSeqToTerm, out t);
                        }
                    }
                    GetSymbol(_TS.Union(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                         Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                         TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose, VerbatimStringLiteral),
                               false, true);
                } while (!(_TS.Contains(symbol.TerminalId)));
                tokenSeqToTerm.ConstructPrefixTerm(out t);
            }
            #endregion

            #region GetIdentifier
            /// <summary> 
            /// retrieves a variable's identifier from an input `TerminalSet` and assigns it to a 
            /// `BaseTerm` parameter, or creates a new variable with the specified identifier if 
            /// it does not exist. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet containing the symbol to be identified. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// variable that will be generated or retrieved from the symbol table. 
            /// </param> 
            private void GetIdentifier(TerminalSet _TS, out BaseTerm t)
            {
                GetSymbol(new TerminalSet(terminalCount, Identifier), true, true);
                string id = symbol.ToString();
                t = engine.GetVariable(id);
                if (t == null)
                {
                    t = new NamedVariable(id);
                    engine.SetVariable(t, id);
                }
                else
                    engine.RegisterVarNonSingleton(id);
            }
            #endregion

            #region ArgumentList
            /// <summary> 
            /// parses a list of arguments from a given input stream, separating them with a 
            /// specified separator (defaulting to a comma). It returns an array of `BaseTerm` 
            /// objects representing the arguments. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet containing the terminals to be processed and used to store the processed 
            /// terminals during the function's execution. 
            /// </param> 
            /// <param name="BaseTerm[]"> 
            /// 2D array of base terms returned by the function after parsing the argument list. 
            /// </param> 
            /// <param name="commaIsSeparator"> 
            /// setting for the comma operator in the list of arguments, determining whether it 
            /// separates or not. 
            /// </param> 
            private void ArgumentList(TerminalSet _TS, out BaseTerm[] args, bool commaIsSeparator)
            {
                bool b = isReservedOperatorSetting;
                List<BaseTerm> argList = new List<BaseTerm>();
                BaseTerm a;
                bool saveStatus = SetCommaAsSeparator(commaIsSeparator);
                SetReservedOperators(true);
                while (true)
                {
                    PrologTermEx(_TS.Union(terminalCount, Comma), out a);
                    argList.Add(a);
                    GetSymbol(_TS.Union(terminalCount, Comma), false, true);
                    if (symbol.TerminalId == Comma)
                    {
                        symbol.SetProcessed();
                    }
                    else
                        break;
                }
                SetCommaAsSeparator(saveStatus);
                SetReservedOperators(b);
                args = argList.ToArray();
            }
            #endregion

            #region ListPatternMembers
            /// <summary> 
            /// processes a list pattern, consisting of a sequence of tokens, and builds an array 
            /// of `ListPatternElem` representing the pattern's members. 
            /// </summary> 
            /// <param name="_TS"> 
            /// 3-adic terminal set containing the current symbol being processed, and is used to 
            /// determine which symbols are valid for the pattern matching. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// term that will be used as the root of the pattern list. 
            /// </param> 
            private void ListPatternMembers(TerminalSet _TS, out BaseTerm t)
            {
                bool b = isReservedOperatorSetting;
                List<SearchTerm> searchTerms;
                bool saveStatus = SetCommaAsSeparator(true);
                int saveEllipsis = terminalTable[ELLIPSIS];
                int saveNegate = terminalTable[NEGATE];
                int saveSubtree = terminalTable[SUBTREE];
                SetReservedOperators(true);
                bool isRangeVar;
                bool lastWasRange = false;
                List<ListPatternElem> rangeTerms = new List<ListPatternElem>();
                try
                {
                    bool isSearchTerm = false;
                    BaseTerm RangeVar = null;
                    BaseTerm minLenTerm;
                    BaseTerm maxLenTerm;
                    BaseTerm altListName = null;
                    minLenTerm = maxLenTerm = new DecimalTerm(0);
                    searchTerms = null;
                    bool isSingleVar;
                    bool isNegSearch = false;
                    while (true)
                    {
                        terminalTable[ELLIPSIS] = EllipsisSym;
                        terminalTable[NEGATE] = NegateSym;
                        terminalTable[SUBTREE] = SubtreeSym;
                        GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                                   Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                                   EllipsisSym, NegateSym, TrySym, WrapOpen, WrapClose, AltListOpen,
                                                                   AltListClose, VerbatimStringLiteral), false, true);
                        if (symbol.IsMemberOf(LCuBracket, EllipsisSym))
                        {
                            if (lastWasRange)
                            {
                                rangeTerms.Add(new ListPatternElem(minLenTerm, maxLenTerm, RangeVar, null, null, false, false));
                                RangeVar = null;
                            }
                            Range(_TS.Union(terminalCount, Comma), out minLenTerm, out maxLenTerm);
                            lastWasRange = true;
                        }
                        else
                        {
                            isRangeVar = false;
                            AlternativeTerms(_TS.Union(terminalCount, Comma, LCuBracket, EllipsisSym),
                                             saveEllipsis, saveNegate, saveSubtree, out searchTerms, out altListName, out isSingleVar, out isNegSearch
                                             );
                            isSearchTerm = true;
                            GetSymbol(_TS.Union(terminalCount, Comma, LCuBracket, EllipsisSym), false, true);
                            if (symbol.IsMemberOf(LCuBracket, EllipsisSym))
                            {
                                if (!isSingleVar) IO.Error("Range specifier may be preceded by a variable only");
                                if (lastWasRange)
                                    rangeTerms.Add(new ListPatternElem(minLenTerm, maxLenTerm, RangeVar, null, null, false, false));
                                Range(_TS.Union(terminalCount, Comma), out minLenTerm, out maxLenTerm);
                                isRangeVar = true;
                                lastWasRange = true;
                                isSearchTerm = false;
                            }
                            if (isRangeVar)
                                RangeVar = searchTerms[0].term;
                            else
                                lastWasRange = false;
                        }
                        if (isSearchTerm)
                        {
                            rangeTerms.Add(new ListPatternElem(minLenTerm, maxLenTerm, RangeVar, altListName, searchTerms, isNegSearch, false));
                            isSearchTerm = false;
                            RangeVar = null;
                            altListName = null;
                            searchTerms = null;
                            minLenTerm = maxLenTerm = new DecimalTerm(0);
                        }
                        GetSymbol(_TS.Union(terminalCount, Comma), false, true);
                        if (symbol.TerminalId == Comma)
                        {
                            symbol.SetProcessed();
                        }
                        else
                            break;
                    }
                    if (lastWasRange) rangeTerms.Add(new ListPatternElem(minLenTerm, maxLenTerm, RangeVar, null, null, false, false));
                    t = new ListPatternTerm(rangeTerms.ToArray());
                }
                finally
                {
                    SetCommaAsSeparator(saveStatus);
                    terminalTable[ELLIPSIS] = saveEllipsis;
                    terminalTable[NEGATE] = saveNegate;
                    terminalTable[SUBTREE] = saveSubtree;
                    SetReservedOperators(b);
                }
            }
            #endregion

            #region AlternativeTerms
            /// <summary> 
            /// parses a list of search terms and their alternatives using Prolog syntax, allowing 
            /// for nested alternatives and singles variables. It returns the search terms and 
            /// alternative terms in a list. 
            /// </summary> 
            /// <param name="_TS"> 
            /// terminal set of symbols being processed, and it is used to determine which symbols 
            /// are allowed or disallowed in the alternatives list. 
            /// </param> 
            /// <param name="saveEllipsis"> 
            /// EllipsisSym terminal symbol, which is saved for later use in constructing the 
            /// alternatives list. 
            /// </param> 
            /// <param name="saveNegate"> 
            /// 2-bit code for the "NEGATE" terminal, which when passed to the `GetSymbol` method 
            /// indicates that the subsequent symbol should be negated. 
            /// </param> 
            /// <param name="saveSubtree"> 
            /// subtree of the current symbol being processed, and it is used to preserve the 
            /// subtree information for further processing during the alternating term rewrite 
            /// rule application. 
            /// </param> 
            /// <param name="List<SearchTerm>"> 
            /// list of search terms that will be generated by the function, and it is initialised 
            /// to an empty list at the start of the function. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// base term that is generated by the `GetSymbol` function for each iteration of the 
            /// while loop. 
            /// </param> 
            /// <param name="bool"> 
            /// isNegSearch flag, which indicates whether the alternatives list should be negated 
            /// if a `~` symbol is encountered before it. 
            /// </param> 
            /// <param name="bool"> 
            /// negation of the alternatives list, which determines whether the `NegateSym` symbol 
            /// should be treated as an explicit negation or not. 
            /// </param> 
            private void AlternativeTerms(TerminalSet _TS,
                                          int saveEllipsis, int saveNegate, int saveSubtree, out List<SearchTerm> searchTerms,
                                          out BaseTerm altListName, out bool isSingleVar, out bool isNegSearch)
            {
                searchTerms = new List<SearchTerm>();
                BaseTerm t;
                altListName = null;
                bool first = true;
                DownRepFactor downRepFactor = null;
                isNegSearch = false;
                while (true)
                {
                    GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                               Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                               NegateSym, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                               VerbatimStringLiteral), false, true);
                    if (symbol.TerminalId == NegateSym)
                    {
                        if (isNegSearch) IO.Error("Only one '~' allowed (which will apply to the entire alternatives list)");
                        GetSymbol(new TerminalSet(terminalCount, NegateSym), true, true);
                        isNegSearch = true;
                    }
                    //terminalTable [ELLIPSIS] = saveEllipsis;
                    //terminalTable [NEGATE]   = saveNegate;
                    //terminalTable [SUBTREE]  = saveSubtree;
                    PrologTermEx(_TS.Union(terminalCount, CutSym, VBar), out t);
                    //terminalTable [ELLIPSIS] = EllipsisSym;
                    //terminalTable [NEGATE]   = NegateSym;
                    //terminalTable [SUBTREE]  = SubtreeSym;
                    if (!first) searchTerms.Add(new SearchTerm(downRepFactor, t));
                    //if (t is AnonymousVariable)
                    //  IO.Warning ("Anonymous variable in alternatives list makes it match anything");
                    GetSymbol(_TS.Union(terminalCount, CutSym, VBar), false, true);
                    if (symbol.IsMemberOf(CutSym, VBar))
                    {
                        GetSymbol(new TerminalSet(terminalCount, CutSym, VBar), false, true);
                        if (symbol.TerminalId == VBar)
                        {
                            symbol.SetProcessed();
                            if (first) searchTerms.Add(new SearchTerm(downRepFactor, t));
                        }
                        else
                        {
                            symbol.SetProcessed();
                            if (first)
                            {
                                if (t is Variable)
                                {
                                    if (isNegSearch)
                                        IO.Error("'~' not allowed before alternatives list name");
                                    else
                                        altListName = t;
                                }
                                else
                                    IO.Error("Variable expected before !");
                                first = false;
                            }
                            else
                                IO.Error("Only one ! allowed for alternatives list");
                        }
                    }
                    else
                        break;
                }
                if (first) searchTerms.Add(new SearchTerm(downRepFactor, t));
                isSingleVar = (searchTerms.Count == 1 && searchTerms[0].term is Variable);
            }
            #endregion

            #region Range
            /// <summary> 
            /// takes a new TerminalSet and out DecimalTerm minLenTerm, and out DecimalTerm 
            /// maxLenTerm as parameters. It parses the given input symbolically and returns the 
            /// minimum and maximum length of the range. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet object that contains the symbols to be processed, and it is used to 
            /// pass the correct input to the function's internal logic. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// starting point for the range calculation, and is used to initialize the `minLenTerm` 
            /// and `maxLenTerm` variables. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// initial value of the minimum and maximum lengths of the terminals in the Range function. 
            /// </param> 
            private void Range(TerminalSet _TS, out BaseTerm minLenTerm, out BaseTerm maxLenTerm)
            {
                try
                {
                    savePlusSym = terminalTable[PLUSSYM];
                    saveTimesSym = terminalTable[TIMESSYM];
                    saveQuestionMark = terminalTable[QUESTIONMARK];
                    terminalTable[PLUSSYM] = PlusSym;
                    terminalTable[TIMESSYM] = TimesSym;
                    terminalTable[QUESTIONMARK] = QuestionMark;
                    GetSymbol(new TerminalSet(terminalCount, LCuBracket, EllipsisSym), false, true);
                    if (symbol.TerminalId == LCuBracket)
                    {
                        int minLen = 0;
                        int maxLen = 0;
                        minLenTerm = maxLenTerm = DecimalTerm.ZERO;
                        GetSymbol(new TerminalSet(terminalCount, LCuBracket), true, true);
                        GetSymbol(_TS.Union(terminalCount, Comma, Identifier, IntLiteral, PlusSym, TimesSym, QuestionMark), false, true);
                        if (symbol.IsMemberOf(Comma, Identifier, IntLiteral, RCuBracket))
                        {
                            GetSymbol(new TerminalSet(terminalCount, Comma, Identifier, IntLiteral, RCuBracket), false, true);
                            if (symbol.IsMemberOf(Identifier, IntLiteral))
                            {
                                GetSymbol(new TerminalSet(terminalCount, Identifier, IntLiteral), false, true);
                                if (symbol.TerminalId == IntLiteral)
                                {
                                    symbol.SetProcessed();
                                    minLen = maxLen = symbol.ToInt();
                                    minLenTerm = maxLenTerm = new DecimalTerm(minLen);
                                }
                                else
                                {
                                    GetIdentifier(new TerminalSet(terminalCount, Comma, RCuBracket), out minLenTerm);
                                    maxLenTerm = minLenTerm;
                                }
                            }
                            GetSymbol(new TerminalSet(terminalCount, Comma, RCuBracket), false, true);
                            if (symbol.TerminalId == Comma)
                            {
                                symbol.SetProcessed();
                                maxLen = Infinite;
                                maxLenTerm = new DecimalTerm(Infinite);
                                GetSymbol(new TerminalSet(terminalCount, Identifier, IntLiteral, RCuBracket), false, true);
                                if (symbol.IsMemberOf(Identifier, IntLiteral))
                                {
                                    GetSymbol(new TerminalSet(terminalCount, Identifier, IntLiteral), false, true);
                                    if (symbol.TerminalId == IntLiteral)
                                    {
                                        symbol.SetProcessed();
                                        if (minLen > (maxLen = symbol.ToInt()))
                                            IO.Error("Range lower bound {0} not allowed to be greater than range upper bound {1}", minLen, maxLen);
                                        maxLenTerm = new DecimalTerm(maxLen);
                                    }
                                    else
                                    {
                                        GetIdentifier(new TerminalSet(terminalCount, RCuBracket), out maxLenTerm);
                                    }
                                }
                            }
                        }
                        else if (symbol.TerminalId == TimesSym)
                        {
                            symbol.SetProcessed();
                            minLenTerm = new DecimalTerm(0);
                            maxLenTerm = new DecimalTerm(Infinite);
                        }
                        else if (symbol.TerminalId == PlusSym)
                        {
                            symbol.SetProcessed();
                            minLenTerm = new DecimalTerm(1);
                            maxLenTerm = new DecimalTerm(Infinite);
                        }
                        else if (symbol.TerminalId == QuestionMark)
                        {
                            symbol.SetProcessed();
                            minLenTerm = new DecimalTerm(0);
                            maxLenTerm = new DecimalTerm(1);
                        }
                        GetSymbol(new TerminalSet(terminalCount, RCuBracket), true, true);
                    }
                    else
                    {
                        symbol.SetProcessed();
                        minLenTerm = new DecimalTerm(0);
                        maxLenTerm = new DecimalTerm(Infinite);
                    }
                }
                finally
                {
                    terminalTable[PLUSSYM] = savePlusSym;
                    terminalTable[TIMESSYM] = saveTimesSym;
                    terminalTable[QUESTIONMARK] = saveQuestionMark;
                }
            }
            #endregion

            #region TryCatchClause
            /// <summary> 
            /// processes a ` Try...Catch` clause in a Prolog term, parsing the `Try`, `Catch`, 
            /// and any clauses, and adding them to a list of terms. 
            /// </summary> 
            /// <param name="_TS"> 
            /// 32-bit term sequence number of the current token being analyzed in the Prolog term 
            /// generator. 
            /// </param> 
            /// <param name="tokenSeqToTerm"> 
            /// 2D array that stores the sequence of symbols to be generated by the `PrologTermEx` 
            /// method, which is called recursively within the function to generate the terms 
            /// corresponding to the symbol sequence. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// term that is being generated by the `TryCatchClause` function. 
            /// </param> 
            private void TryCatchClause(TerminalSet _TS, TokenSeqToTerm tokenSeqToTerm, out BaseTerm t)
            {
                GetSymbol(new TerminalSet(terminalCount, TrySym), true, true);
                bool nullClass = false;
                tokenSeqToTerm.Add(new TryOpenTerm());
                tokenSeqToTerm.Add(CommaOpTriplet);
                GetSymbol(new TerminalSet(terminalCount, LeftParen), true, true);
                PrologTermEx(new TerminalSet(terminalCount, RightParen), out t);
                GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                tokenSeqToTerm.Add(t);
                tokenSeqToTerm.Add(CommaOpTriplet);
                List<string> ecNames = new List<string>();
                int catchSeqNo = 0;
                do
                {
                    GetSymbol(new TerminalSet(terminalCount, CatchSym), true, true);
                    if (nullClass)
                        IO.Error("No CATCH-clause allowed after CATCH-clause without exception class");
                    string exceptionClass = null;
                    BaseTerm msgVar = null;
                    GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, Atom), false, true);
                    if (symbol.IsMemberOf(Identifier, IntLiteral, Atom))
                    {
                        GetSymbol(new TerminalSet(terminalCount, Identifier, IntLiteral, Atom), false, true);
                        if (symbol.IsMemberOf(IntLiteral, Atom))
                        {
                            bool saveStatus = SetCommaAsSeparator(true);
                            GetSymbol(new TerminalSet(terminalCount, IntLiteral, Atom), false, true);
                            if (symbol.TerminalId == Atom)
                            {
                                symbol.SetProcessed();
                            }
                            else
                            {
                                symbol.SetProcessed();
                            }
                            if (ecNames.Contains(exceptionClass = symbol.ToString()))
                                IO.Error("Duplicate exception class name '{0}'", exceptionClass);
                            else
                                ecNames.Add(exceptionClass);
                            GetSymbol(new TerminalSet(terminalCount, Comma, LeftParen, Identifier), false, true);
                            if (symbol.IsMemberOf(Comma, Identifier))
                            {
                                GetSymbol(new TerminalSet(terminalCount, Comma, Identifier), false, true);
                                if (symbol.TerminalId == Comma)
                                {
                                    symbol.SetProcessed();
                                }
                                GetIdentifier(new TerminalSet(terminalCount, LeftParen), out msgVar);
                            }
                            SetCommaAsSeparator(saveStatus);
                        }
                        else
                        {
                            GetIdentifier(new TerminalSet(terminalCount, LeftParen), out msgVar);
                        }
                    }
                    nullClass = nullClass || (exceptionClass == null);
                    if (msgVar == null) msgVar = new AnonymousVariable();
                    tokenSeqToTerm.Add(new CatchOpenTerm(exceptionClass, msgVar, catchSeqNo++));
                    tokenSeqToTerm.Add(CommaOpTriplet);
                    t = null;
                    GetSymbol(new TerminalSet(terminalCount, LeftParen), true, true);
                    GetSymbol(new TerminalSet(terminalCount, LeftParen, RightParen, Identifier, IntLiteral, RealLiteral, ImagLiteral,
                                                               StringLiteral, Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket,
                                                               ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                               VerbatimStringLiteral), false, true);
                    if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                           Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                           AltListOpen, AltListClose, VerbatimStringLiteral))
                    {
                        PrologTermEx(new TerminalSet(terminalCount, RightParen), out t);
                    }
                    GetSymbol(new TerminalSet(terminalCount, RightParen), true, true);
                    if (t != null)
                    {
                        tokenSeqToTerm.Add(t);
                        tokenSeqToTerm.Add(CommaOpTriplet);
                    }
                    GetSymbol(_TS.Union(terminalCount, CatchSym), false, true);
                } while (!(_TS.Contains(symbol.TerminalId)));
                tokenSeqToTerm.Add(TC_CLOSE);
            }
            #endregion

            #region OptionalPrologTerm
            /// <summary> 
            /// retrieves a symbol from the input stream and processes it based on its type. If 
            /// the symbol is an identifier, integer, real, or imaginary number, it is stored in 
            /// the `t` variable. Otherwise, it calls `PrologTerm` to retrieve another symbol. 
            /// </summary> 
            /// <param name="_TS"> 
            /// terminal set that contains the input symbols to be processed by the `OptionalPrologTerm` 
            /// function. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// term being processed and is used to store the result of the function's operation. 
            /// </param> 
            private void OptionalPrologTerm(TerminalSet _TS, out BaseTerm t)
            {
                t = null;
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                           EndOfInput, Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket,
                                                           ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                           VerbatimStringLiteral), false, true);
                if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                       Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                       AltListOpen, AltListClose, VerbatimStringLiteral))
                {
                    PrologTerm(new TerminalSet(terminalCount, Dot), out t);
                    GetSymbol(new TerminalSet(terminalCount, Dot), true, true);
                }
                else
                {
                    symbol.SetProcessed();
                }
            }
            #endregion

            #region List
            /// <summary> 
            /// takes a `TerminalSet` and an output `BaseTerm` and retrieves symbols from the input 
            /// stream, constructing a list term. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet to be processed, which contains the terminals that make up the list 
            /// to be generated. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// term that will be returned by the `List` function after processing the symbol table. 
            /// </param> 
            private void List(TerminalSet _TS, out BaseTerm term)
            {
                BaseTerm afterBar = null;
                terminalTable[OP] = Atom;
                terminalTable[WRAP] = Atom;
                BaseTerm[] elements = null;
                GetSymbol(new TerminalSet(terminalCount, LSqBracket), true, true);
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                           Operator, Atom, Anonymous, CutSym, LSqBracket, RSqBracket, LCuBracket,
                                                           ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                           VerbatimStringLiteral), false, true);
                if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                       Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                       AltListOpen, AltListClose, VerbatimStringLiteral))
                {
                    ArgumentList(new TerminalSet(terminalCount, RSqBracket, VBar), out elements, true);
                    GetSymbol(new TerminalSet(terminalCount, RSqBracket, VBar), false, true);
                    if (symbol.TerminalId == VBar)
                    {
                        symbol.SetProcessed();
                        PrologTerm(new TerminalSet(terminalCount, RSqBracket), out afterBar);
                    }
                }
                terminalTable[OP] = OpSym;
                terminalTable[WRAP] = WrapSym;
                GetSymbol(new TerminalSet(terminalCount, RSqBracket), true, true);
                term = (afterBar == null) ? new ListTerm() : afterBar;
                if (elements != null) term = ListTerm.ListFromArray(elements, term);
            }
            #endregion

            #region AltList
            /// <summary> 
            /// generates a term representing an alternative list, given a terminal set and a base 
            /// term. It first checks if there is a matching close bracket for the open bracket 
            /// provided, then it processes the symbol table to generate the alternative list. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet object that contains the terminals to be processed by the `AltList` function. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// base term that is being generated as part of the alternative list expansion process. 
            /// </param> 
            private void AltList(TerminalSet _TS, out BaseTerm term)
            {
                BaseTerm afterBar = null;
                terminalTable[OP] = Atom;
                terminalTable[WRAP] = Atom;
                BaseTerm[] elements = null;
                GetSymbol(new TerminalSet(terminalCount, AltListOpen), true, true);
                string altListOpen = symbol.ToString();
                string altListClose = engine.AltListTable.FindCloseBracket(altListOpen);
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                           Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen,
                                                           TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                           VerbatimStringLiteral), false, true);
                if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                       Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                       AltListOpen, AltListClose, VerbatimStringLiteral))
                {
                    ArgumentList(new TerminalSet(terminalCount, VBar, AltListClose), out elements, true);
                    GetSymbol(new TerminalSet(terminalCount, VBar, AltListClose), false, true);
                    if (symbol.TerminalId == VBar)
                    {
                        symbol.SetProcessed();
                        PrologTerm(new TerminalSet(terminalCount, AltListClose), out afterBar);
                    }
                }
                terminalTable[OP] = OpSym;
                terminalTable[WRAP] = WrapSym;
                GetSymbol(new TerminalSet(terminalCount, AltListClose), true, true);
                if (symbol.ToString() != altListClose)
                    IO.Error("Illegal alternative list close token: got '{0}' expected '{1}'",
                               symbol.ToString(), altListClose);
                term = (afterBar == null) ? new AltListTerm(altListOpen, altListClose) : afterBar;
                if (elements != null)
                    term = AltListTerm.ListFromArray(altListOpen, altListClose, elements, term);
            }
            #endregion

            #region DCGBracketList
            /// <summary> 
            /// performs a DCg bracket analysis on a given input and returns a list of terms. 
            /// </summary> 
            /// <param name="_TS"> 
            /// TerminalSet to which the DCG bracket list is being generated for. 
            /// </param> 
            /// <param name="BaseTerm"> 
            /// result of the previous term combination and is used to initialize the next term combination. 
            /// </param> 
            private void DCGBracketList(TerminalSet _TS, out BaseTerm term)
            {
                terminalTable[OP] = Atom;
                terminalTable[WRAP] = Atom;
                BaseTerm[] elements = null;
                GetSymbol(new TerminalSet(terminalCount, LCuBracket), true, true);
                GetSymbol(new TerminalSet(terminalCount, LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral,
                                                           Operator, Atom, Anonymous, CutSym, LSqBracket, LCuBracket, RCuBracket,
                                                           ListPatternOpen, TrySym, WrapOpen, WrapClose, AltListOpen, AltListClose,
                                                           VerbatimStringLiteral), false, true);
                if (symbol.IsMemberOf(LeftParen, Identifier, IntLiteral, RealLiteral, ImagLiteral, StringLiteral, Operator, Atom,
                                       Anonymous, CutSym, LSqBracket, LCuBracket, ListPatternOpen, TrySym, WrapOpen, WrapClose,
                                       AltListOpen, AltListClose, VerbatimStringLiteral))
                {
                    ArgumentList(new TerminalSet(terminalCount, RCuBracket), out elements, true);
                }
                GetSymbol(new TerminalSet(terminalCount, RCuBracket), true, true);
                term = BaseTerm.NULLCURL;
                if (elements != null)
                    if (readingDcgClause)
                        for (int i = elements.Length - 1; i >= 0; i--)
                            term = new DcgTerm(elements[i], term);
                    else
                        term = new CompoundTerm(CURL, elements);
            }
            #endregion


            #endregion PARSER PROCEDURES
        }
        #endregion PrologParser
    }
}