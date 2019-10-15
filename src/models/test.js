// Requirements
// Input: String
// Output: Boolean true or false

// Algorithm
// Create an empty object
// Iterate through the string
// If the string is in the object, increment the count
// Else set count = 1
// Iterate through the key-value pairs in the object
// Check if more than one key-value pair has count = 1
// If true, return false
// Return true

// const checkPalindromePermutation = (string) => {
//   let count = 0;
//   let hsh = {}
//   for (let i = 0; i < string.length; i += 1) {
//     const currentChar = string[i]

//     if (hsh[currentChar]) {
//       hsh[currentChar] += 1
//     } else {
//       hsh[currentChar] = 1
//     }
//   }

//   for (key in hsh) {
//     if (hsh[key] === 1) {
//       count += 1
//     }
//   }

//   if (count < 2) {
//     return true
//   }
//   return false;
// }

const checkPalindromePermutation = (string) => {
  let unpairedCharacters = new Set();

  for (let i = 0; i < string.length; i += 1) {
    const char = string[i];

    if (unpairedCharacters.has(char)) {
      unpairedCharacters.delete(char)
    } else {
      unpairedCharacters.add(char)
    }
  }
  return unpairedCharacters.size <= 1;
}

console.log(checkPalindromePermutation('civic'))
console.log(checkPalindromePermutation('ivicc'))
console.log(checkPalindromePermutation('civil'))
console.log(checkPalindromePermutation('livci'))