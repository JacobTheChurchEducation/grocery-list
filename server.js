require('dotenv').config()

const express = require('express')

const notion = require('./notion')
const { getShoppingData, addInsert, boxCheck, checkFinanceInsert, addPaidAmount } = require("./notion");
const {Client} = require("@notionhq/client");

// const lidl = require('./getLidlRefreshToken')



const app = express()
app.set("views", "./views")
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


let shoppingItems = []

let jacobEndResult = 0;
let emisEndResult = 0;





app.post("/results", async function(req,res) {

   try {
      const {array} = req.body;




      const notion = new Client({auth: process.env.NOTION_API_KEY});


      // console.log(array)

      for (let element of array) {

         let check = 0;
         let jacobResult = 0;
         let emisResult = 0;

         const price = (await notion.pages.retrieve({page_id: element.pageID})).properties.Cost.number;



         for (let shoppingItem of element.shoppingList) {
            // console.log(shoppingItem)

            if (shoppingItem.price === '') throw new Error('Price is empty')
            else {
               check += parseFloat(shoppingItem.price);
               switch (shoppingItem.multiplier) {
                  case 'normal':
                     jacobResult += 2 / 3 * parseFloat(shoppingItem.price);
                     emisResult += 1 / 3 * parseFloat(shoppingItem.price);
                     break;

                  case 'fiftyfifty':
                     jacobResult += 1 / 2 * parseFloat(shoppingItem.price);
                     emisResult += 1 / 2 * parseFloat(shoppingItem.price);
                     break;
                  case 'jacob':
                     jacobResult += parseFloat(shoppingItem.price);
                     break
                  case 'Emi':
                     emisResult += parseFloat(shoppingItem.price);
                     break;
                  default:
                     throw new Error('Wrong multiplier')
               }
            }





         }
         check = Math.round(check * 100) / 100
         if (check !== price) throw new Error('Check: ' + check + ' does not match with price: ' + price);
         else {
            boxCheck(element.pageID);
            addPaidAmount(element.pageID)

            var date = new Date();
            jacobResult = Math.round(jacobResult * 100) / 100

            emisResult = Math.round(emisResult * 100) / 100



            if (jacobResult !== 0 && await checkFinanceInsert(-jacobResult, date.toISOString(), process.env.NOTION_PERSON_Jacob)) {
               // console.log(jacobResult, date, process.env.NOTION_PERSON_Jacob)
               // console.log('For jac: ',  await checkFinanceInsert(-jacobResult, date, process.env.NOTION_PERSON_Jacob))

               addInsert({title: 'Test', cost: -jacobResult, date: date, person: process.env.NOTION_PERSON_Jacob})

            }

            if (emisResult !== 0 && await checkFinanceInsert(-emisResult, date, process.env.NOTION_PERSON_EMILY)) {
               // console.log(emisResult, date, process.env.NOTION_PERSON_EMILY)
               // checkFinanceInsert(emisResult, date, process.env.NOTION_PERSON_EMILY)
               // console.log('For emi: ', await checkFinanceInsert(-emisResult, date, process.env.NOTION_PERSON_EMILY))

               addInsert({title: 'Test', cost: -emisResult, date: date, person: process.env.NOTION_PERSON_EMILY})
            }

            jacobEndResult += jacobResult;
            emisEndResult += emisResult;



         }
      }

} catch (error)
   {
      console.log('Error: ' + error)
   }





   // for(let i = 0; i < array.length; i++) {
   //
   //    if (array[i][0] !== '') {
   //       if ('normal' === array[i][1]) {
   //
   //          jacobResult += 2 / 3 * parseFloat(array[i][0]);
   //          emisResult += 1 / 3 * parseFloat(array[i][0]);
   //
   //       } else if (array[i][1] === 'fiftyfifty') {
   //
   //          jacobResult += 1 / 2 * parseFloat(array[i][0]);
   //          emisResult += 1 / 2 * parseFloat(array[i][0]);
   //
   //       } else if (array[i][1] === 'jacob') {
   //
   //          jacobResult += parseFloat(array[i][0]);
   //
   //       } else if (array[i][1] === 'Emi') {
   //
   //          emisResult += parseFloat(array[i][0]);
   //
   //       }
   //    }
   // }
   // let check = 0;
   //
   //
   // for (let element of pageIds) {
   //    // boxCheck(element)
   //    const response = await notion.pages.retrieve({ page_id: element });
   //
   //    console.log(typeof response.properties.Cost.number)
   //
   //    check += response.properties.Cost.number;
   //    // console.log('Add number: ' + response.properties.Cost.number + ' to checksum')
   //
   //    // console.log('Checksum after ading: ' + check)
   //
   // }
   //
   // // check = Math.round(check * 100) / 100
   //
   //
   // // console.log('Final jacob: ' + jacobResult);
   // // console.log('Final emi: ' + emisResult);
   //
   // if( Math.round((jacobResult + emisResult) * 100)/100 === check)
   // {
   //    var date = new Date();
   //    // var date = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
   //
   //
   //    jacobResult = Math.round(jacobResult * 100) / 100
   //
   //    emisResult = Math.round(emisResult * 100) / 100
   //
   //    pageIds.forEach(function(element) {
   //       // boxCheck(element)
   //       addPaidAmount(element)
   //    })
   //
   // if(jacobResult !== 0 && await checkFinanceInsert(-jacobResult, date.toISOString(), process.env.NOTION_PERSON_Jacob))
   // {
   //    // console.log(jacobResult, date, process.env.NOTION_PERSON_Jacob)
   //    // console.log('For jac: ',  await checkFinanceInsert(-jacobResult, date, process.env.NOTION_PERSON_Jacob))
   //
   //    addInsert({title: 'Test' , cost: -jacobResult, date: date, person: process.env.NOTION_PERSON_Jacob})
   //
   // }
   //
   // if(emisResult !== 0 && await checkFinanceInsert(-emisResult, date, process.env.NOTION_PERSON_EMILY) )
   // {
   //    // console.log(emisResult, date, process.env.NOTION_PERSON_EMILY)
   //    // checkFinanceInsert(emisResult, date, process.env.NOTION_PERSON_EMILY)
   //    // console.log('For emi: ', await checkFinanceInsert(-emisResult, date, process.env.NOTION_PERSON_EMILY))
   //
   //    addInsert({title: 'Test' , cost: -emisResult, date: date, person: process.env.NOTION_PERSON_EMILY})
   // }
   //
   //    jacobEndResult += jacobResult;
   //    emisEndResult += emisResult;
   //
   // res.send({ message: 'Success'})
   // }
   // else {
   //    console.log('Check does not fulfill')
   //    console.log('Sum: ' + (jacobResult + emisResult)  + ' check: ' + check)
   // }
})


app.get("/", (req,res) => {
   res.render("index", { shoppingItems, jacobEndResult, emisEndResult });

   getShoppingData().then(data => {
      shoppingItems = data
      // console.log(shoppingItems)

   })
})


app.listen(process.env.PORT, () => {

   console.log(`App is listening at localhost:${process.env.PORT}`)
})
