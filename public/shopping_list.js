function calc()
{

    let array = []


    let tables = document.querySelectorAll('table')


    try {
        for (let table of tables) {
            let prices = table.querySelectorAll('.prices');
            let multiplier = table.querySelectorAll('.multipliers');
            if (prices.length === multiplier.length) {
                let shopping_list = []
                for (let i = 0; i < prices.length; i++) {
                    if(prices[i].value === '') {
                        throw new Error('price is empty')
                    }
                    else {



                        shopping_list.push({
                            price: prices[i].value,
                            multiplier: multiplier[i].value
                        })
                    }
                }


                array.push({
                    'pageID': table.getAttribute('pageid'),
                    'shoppingList': shopping_list
                })

            } else {
                throw new Error('Prices does not match multipliers')
            }

        }

        fetch("/results", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ array: array}),
        }).then(response => {
            window.location.href = 'localhost:3000/'
        })
    }
    catch(error) {
        console.log('Error: ' + error)
    }

}



