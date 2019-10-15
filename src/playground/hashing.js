const bcrypt = require('bcryptjs')

const myFunction = async () => {
  const password = 'Red12345'

  const hashedPassword = await bcrypt.hash(password, 8);
  const comparePassword = await bcrypt.compare(password, hashedPassword)
  return comparePassword
}

myFunction().then((result) => {
  
  console.log(result)
})
