export const dummyData = [
    {
        title: "recursion",
        volume: 120,
        mention: "1 day ago",
        assignment: "Assignment 1",
        questions: [
            {
                topic: "base case",
                questions: [
                    { text: "how do I identify the base case?", frequency: 13 },
                    { text: "how do I use the base case?", frequency: 9 },
                    { text: "base case for recursion", frequency: 12 },
                    { text: "what is the base case and how does it apply to the recursion part of the assignment?", 
                        frequency: 1 }
                ]
            },
            {
                topic: "infinite loops",
                questions: [
                    { text: "how do I stop creating infinite loops?", frequency: 20 },
                    { text: "I keep getting infinite loops when doing the recursion", frequency: 10 },
                    { text: "infinite loops mistake recursion", frequency: 7 }
                ]
            },
            {
                topic: "call stack",
                questions: [
                    { text: "how does the call stack behave when executing a recursive function?", frequency: 11 },
                    { text: "how does the system decide when to remove a function from the call stack?", frequency: 7 }
                ]
            }
        ]
    },
    {
        title: "call frames",
        volume: 83,
        mention: "1 day ago",
        assignment: "Assignment 2",
        questions: [
            {
                topic: "execution context",
                questions: [
                    { text: "what exactly is a call frame in javascript?", frequency: 18 },
                    { text: "how does the execution context relate to call frames?", frequency: 12 },
                    { text: "why do call frames form a stack?", frequency: 9 }
                ]
            },
            {
                topic: "debugging",
                questions: [
                    { text: "how to read call frames in chrome devtools?", frequency: 15 },
                    { text: "why do I see anonymous in my call frames?", frequency: 11 },
                    { text: "how to trace variable values through call frames?", frequency: 8 }
                ]
            }
        ]
    },
    {
        title: "tuples",
        volume: 67,
        mention: "4 days ago",
        assignment: "Assignment 1",
        questions: [
            {
                topic: "immutability",
                questions: [
                    { text: "why can't I modify a tuple after creation?", frequency: 12 },
                    { text: "when should I use tuples instead of lists?", frequency: 8 },
                    { text: "how to convert a tuple to a list?", frequency: 5 }
                ]
            },
            {
                topic: "operations",
                questions: [
                    { text: "how to access tuple elements?", frequency: 10 },
                    { text: "can I concatenate two tuples?", frequency: 7 },
                    { text: "how to find the length of a tuple?", frequency: 4 }
                ]
            }
        ]
    },
    {
        title: "for loops",
        volume: 52,
        mention: "7 days ago",
        assignment: "Assignment 2",
        questions: [
            {
                topic: "syntax",
                questions: [
                    { text: "what's the difference between for and while loops?", frequency: 15 },
                    { text: "how to loop through a list with indexes?", frequency: 12 },
                    { text: "can I use else with for loops?", frequency: 6 }
                ]
            },
            {
                topic: "optimization",
                questions: [
                    { text: "why is my for loop so slow?", frequency: 9 },
                    { text: "how to break out of a nested for loop?", frequency: 8 },
                    { text: "what's the fastest way to iterate in python?", frequency: 7 }
                ]
            }
        ]
    },
    {
        title: "nested lists",
        volume: 52,
        mention: "1 day ago",
        assignment: "Assignment 1",
        questions: [
            {
                topic: "accessing elements",
                questions: [
                    { text: "how to access elements in a 2d list?", frequency: 14 },
                    { text: "best way to flatten a nested list?", frequency: 9 },
                    { text: "how to iterate through nested lists?", frequency: 7 }
                ]
            },
            {
                topic: "manipulation",
                questions: [
                    { text: "how to add elements to a nested list?", frequency: 6 },
                    { text: "how to sort a nested list?", frequency: 5 },
                    { text: "how to deep copy a nested list?", frequency: 4 }
                ]
            }
        ]
    },
    {
        title: "debugging",
        volume: 30,
        mention: "1 day ago",
        assignment: "Assignment 2",
        questions: [
            {
                topic: "tools",
                questions: [
                    { text: "how to use pdb debugger?", frequency: 18 },
                    { text: "best vscode extensions for debugging?", frequency: 12 },
                    { text: "how to read stack traces?", frequency: 10 }
                ]
            },
            {
                topic: "techniques",
                questions: [
                    { text: "how to debug infinite loops?", frequency: 15 },
                    { text: "what is rubber duck debugging?", frequency: 8 },
                    { text: "how to debug recursive functions?", frequency: 7 }
                ]
            }
        ]
    },
    {
        title: "while loops",
        volume: 20,
        mention: "32 days ago",
        assignment: "Assignment 1",
        questions: [
            {
                topic: "usage",
                questions: [
                    { text: "when to use while vs for loops?", frequency: 14 },
                    { text: "how to avoid infinite while loops?", frequency: 12 },
                    { text: "can I use break in while loops?", frequency: 6 }
                ]
            },
            {
                topic: "patterns",
                questions: [
                    { text: "how to implement a menu with while loops?", frequency: 8 },
                    { text: "best practices for while true loops?", frequency: 7 },
                    { text: "how to use while loops with user input?", frequency: 5 }
                ]
            }
        ]
    }
];