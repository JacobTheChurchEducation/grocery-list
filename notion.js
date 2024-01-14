

const { Client } = require('@notionhq/client')
const {raw} = require("express");
const {add} = require("nodemon/lib/rules");
const {logLevelSeverity} = require("@notionhq/client/build/src/logging");

const notion = new Client({auth: process.env.NOTION_API_KEY});



async function getTags() {
    const database = await notion.databases.retrieve({ database_id: process.env.NOTION_FINANCE_DATABASE})

    console.log(database)
}

// getTags()


// function notionProperties(properties)
// {
//     return Object.values(properties).reduce((obj, property)s =>{
//         const {id, ...rest} = property
//         return {...obj, [id]: rest}
//
//     }, {})
// }


function addInsert({title, cost, date, person})
{
    notion.pages.create({
        parent: {
            database_id: process.env.NOTION_FINANCE_DATABASE
        },
        properties: {
            [process.env.NOTION_FINANCE_NAME]:
                {
                    title: [
                        {
                            type: 'text',
                            text: {
                                content:title
                            }
                        }
                    ]
                },
            [process.env.NOTION_FINANCE_COST]:
                {
                   number: cost
                },
            [process.env.NOTION_FINANCE_DATE]:
                {
                    date: {
                        start: date
                    }
                },
            [process.env.NOTION_FINANCE_PERSON]:
                {
                    people: [
                        {
                            object: "user",
                            id: person
                        }
                    ]
                }
        }
    })
}
// addInsert({title : "Emis", cost: 123, date: "2023-04-26", person: process.env.NOTION_PERSON_Jacob})



async function getPages()
{
    return await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter:
                {
                    "property": "Done",
                    "checkbox":
                        {
                            "equals": false
                        }
                }
    })

}


async function getShoppingData()
{
    let pagesArray  = [];
    const notionPages = await getPages();

    // console.log(notionPages.results[0].properties.Cost.number)

try {

    for (let i = 0; i < Object.keys(notionPages.results).length; i++) {

        let element = notionPages.results[i];

        let shoppingItems = await showShoppingItems(element.id);
        let date = element.properties.Date.date.start;
        let cost = element.proper1ties.Cost.number;
        let pageID = element.id

         // boxCheck(element.id)
        // console.log(element.id)

        let subarray = [pageID, date, cost, shoppingItems]
        pagesArray.push(subarray)

    }
}
catch (error)
{
 console.log("Error1: " + error.message)
}

// console.log(pagesArray)
    return pagesArray
}


async function addPaidAmount(pageId)
{

    const response = await notion.pages.retrieve({ page_id: pageId });

    const cost = response.properties.Cost.number

    const date = response.properties.Date.date.start

    const whoPaid = response.properties.Who_paid.people[0].id


    // console.log(cost, date, whoPaid)
     addInsert({title : "Test", cost: cost, date: date, person: whoPaid})


}


async function showShoppingItems(blockID)
{
    const blockId = blockID;
    const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 50,
    });


    let items = response["results"];
    let array = [];

    items.forEach(function(element){

        if(element.to_do !== undefined)
        {
            array.push(element.to_do.rich_text[0].text.content)
        }
        // console.log(element.parent.page_id)

    })
    return array;
}

async function boxCheck(pageID)
{
    await notion.pages.update({
        page_id: pageID,
        properties: {
            'Done': {
                checkbox: true,
            },
        },
    });
    // console.log(response)
}

async function checkFinanceInsert(cost, date, person)
{

    const notionPages = await notion.databases.query({
        database_id: process.env.NOTION_FINANCE_DATABASE,
        filter: {
            "and": [
                {
                    "property": "Cost",
                    "number": {
                        "equals": cost
                    }
                },
                {
                    "property": "Date",
                    "date": {

                        "equals": date
                    }
                },
                {
                    "property": "Person",
                    "people": {
                        "contains": person
                    }
                }

            ]
        }
    })


    // console.log(notionPages)
    //
    // console.log('notionPages.results.length: ', notionPages.results.length)
    return notionPages.results.length === 0
}
//
// checkFinanceInsert()

// checkFinanceInsert(-0.33, 25, process.env.NOTION_PERSON_EMILY)


module.exports = {
    getShoppingData,
    addInsert,
    boxCheck,
    checkFinanceInsert,
    addPaidAmount
}