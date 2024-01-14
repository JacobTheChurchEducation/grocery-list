const { Client } = require('@notionhq/client')
const {raw} = require("express");

const notion = new Client({auth: process.env.NOTION_API_KEY_TASK_LIST})


async function getTags() {
    const database = await notion.databases.retrieve({ database_id: process.env.NOTION_DATABASE_ID_TASK_LIST})

    console.log(notionProperties(database.properties)[process.env.NOTION_Where_ID].select.options)

}



function notionProperties(properties)
{
    return Object.values(properties).reduce((obj, property) =>{
        const {id, ...rest} = property
        return {...obj, [id]: rest}

    }, {})
}

// getTags()


// async function getDatabase()
// {
//     const res = await notion.databases.retrieve({database_id: process.env.NOTION_DATABASE_ID_TASK_LIST})
//
//     console.log(res)
// }
// getDatabase()






// function addInsert({title, cost, date, person, where})
// {
//     notion.pages.create({
//         parent: {
//             database_id: process.env.NOTION_DATABASE_ID
//         },
//         properties: {
//             [process.env.NOTION_Name_ID]:
//                 {
//                     title: [
//                         {
//                             type: 'text',
//                             text: {
//                                 content:title
//                             }
//                         }
//                     ]
//                 },
//             [process.env.NOTION_COST_ID]:
//                 {
//                     number: cost
//                 },
//             [process.env.NOTION_Date_ID]:
//                 {
//                     date: {
//                         start: date
//                     }
//                 },
//             [process.env.NOTION_Who_paid_ID]:
//                 {
//                     people: [
//                         {
//                             object: "user",
//                             id: person
//                         }
//                     ]
//                 },
//             [process.env.NOTION_Where_ID]:
//                 {
//                     select: {
//                         id: where
//                     }
//                 }
//         }
//     })
// }
//
//
// addInsert({title : "Something", cost: 51352345, date: "2023-04-26", person: process.env.NOTION_PERSON_EMILY,where: process.env.NOTION_LIDL})
