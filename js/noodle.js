function level1() {
    console.log("Level 1");
    
    function level2() {
        console.log("Level 2");
        
        function level3() {
            console.log("Level 3");
            
            function level4() {
                console.log("Level 4");
                
                function level5() {
                    console.log("Level 5");
                    
                    function level6() {
                        console.log("Level 6");
                    }
                    
                    level6();
                }
                
                level5();
            }
            
            level4();
        }
        
        level3();
    }
    
    level2();
}

level1();
