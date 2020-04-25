const fs = require("fs")
const CSVtoJSON = require("csvtojson")
const JSONtoCSV = require("json2csv").parse

let main_file_path = __dirname+"/input/main.csv"
let filtered_country_path = __dirname+"/output/filteredCountry.csv"

async function readCSV(path){
    return await CSVtoJSON().fromFile(path)
}    



async function generateFilteredCountryCSV(){
   let data =  await readCSV(main_file_path)
   let filtered_data = []
   data.forEach((entry)=>{
        if(entry.COUNTRY.includes("USA")){
            let price = entry.PRICE
             price = price.slice(1)
             price = parseFloat(price)
             entry.PRICE = price
            filtered_data.push(entry)
        }
   })

   let fields = Object.keys(filtered_data[0])
   await writeCSV(filtered_data,fields,"filteredCountry.csv")
}


async function writeCSV(data,fields,output_file_name){
    let csv = JSONtoCSV(data, {fields:fields})
    fs.writeFileSync(__dirname+"/output/"+output_file_name,csv)
    return "SUCCESS"
}



async function generateMinPrices(){
    let country_data = await readCSV(filtered_country_path)
    let data = {}
   
    country_data.forEach((entry)=>{
        let SKU = entry.SKU
        
        if(data[SKU] === undefined){
            data[SKU] = {
                price_1: parseFloat(entry.PRICE),
                price_2:null
            }
        }

        else {
            let entry_price = parseFloat(entry.PRICE)
            if(entry_price < data[SKU].price_1){
                data[SKU].price_2 = data[SKU].price_1;
                data[SKU].price_1 = entry_price
            }

            if(data[SKU].price_2 == null){
                data[SKU].price_2 = entry_price
            }

            if((data[SKU].price_2 !=null) && (data[SKU].price_2 > entry_price) ){
                data[SKU].price_2 = entry_price
            }


        }
       
    })

  
    let entries = Object.keys(data)

    let lowestPrices = []

    entries.forEach((entry)=>{
        if(data[entry].price_2 != null){
            lowestPrices.push({
                SKU:entry,
                FIRST_MINIMUM_PRICE:data[entry].price_1,
                SECOND_MINIMUM_PRICE:data[entry].price_2
            })
        }
    })
    
   
    let fields = Object.keys(lowestPrices[0])

    return await writeCSV(lowestPrices,fields,"lowestPrice.csv")

}   


async function main(){
    try {
       await generateFilteredCountryCSV()
       await generateMinPrices()

       console.log("All Operations Perfomed")
    } catch (error) {
        console.log("Error : "+error)
    }   
}

main()