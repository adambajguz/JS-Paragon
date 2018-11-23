var idx = 0;

const emptyStringError = "Pole nie może być puste!";
const invalidNumberString = "Błędna wartość!";
const tableDataStorage = "tableData";

window.onload = function () {
    loadLocalStorageToTable();
    let storage = getDataFromLocalStorage();
    idx = storage == null ? 0 : storage.length;

    $('#itemContainer').on('click', 'button.deleteItem', function() {
        var row = $(this).parents('tr')
        console.log(row);
        var row_id = row.children().first()[0].textContent;

        idx = -1;
        removeItemFromLocalStorage(row_id);
        row.remove();


        $('#itemContainer > tr').find('td:first').text(function(i, text){
            return i + 1;
        })
    
    });

    $("#addForm").submit(function () {
        $("#name_error").text("");
        $("#price_error").text("");
        $("#quantity_error").text("");

        var name = $("#name").val();
        var price = $("#price").val();
        var quantity = $("#quantity").val()

        var error = false;

        if (checkQuantityInput(parseInt(quantity)) == false) {
            $("#quantity_error").text(invalidNumberString);;
            error = true;
        }

        if (checkPriceInput(parseFloat(price)) == false) {
            $("#price_error").text(invalidNumberString);
            error = true;
        }

        if (name == "") {
            $("#name_error").text(emptyStringError)
            error = true;
        }

        if (quantity == "") {
            $("#quantity_error").text(emptyStringError);
            error = true;
        }

        if (price == "") {
            $("#price_error").text(emptyStringError)
            error = true;
        }

        if (error == true)
            return false;

        ++idx;
        addItemToTable(idx, name, quantity, price);
        addItemToLocalStorage(idx, name, quantity, price)
 
        $("#name").val("");
        $("#price").val("");
        $("#quantity").val("");
        $("#name").focus();

        return false;
    })
}

function addItemToLocalStorage(id, name, quantity, price) {
    var existingTableData = getDataFromLocalStorage();

    if(existingTableData == null)
        existingTableData = [];

    existingTableData.push({ id: id, name: name, quantity: quantity, price: price });
    localStorage.setItem(tableDataStorage, JSON.stringify(existingTableData));
}

function removeItemFromLocalStorage(id) {
    var existingTableData = getDataFromLocalStorage();
    if(existingTableData == null)
        return;

    idx = 0;

    existingTableData = existingTableData.filter(item => item.id != id)
    existingTableData.forEach(item => item.id = ++idx)

    localStorage.setItem(tableDataStorage, JSON.stringify(existingTableData));
}

function addItemToTable(id, name, quantity, price) {
    var newElement = $("#itemPattern").clone();

    newElement.find(".id").text(id);
    newElement.find(".name").text(name);
    newElement.find(".quantity").text(quantity);
    newElement.find(".price").text(price);

    var total = parseFloat(quantity) * parseFloat(price);
    newElement.find(".total").text(total);

    $("#itemContainer").append(newElement);
    newElement.show();
}

function loadLocalStorageToTable()
{
    var existingTableData = getDataFromLocalStorage();
    if(existingTableData == null)
        return;

    existingTableData.forEach(item => addItemToTable(item.id, item.name, item.quantity, item.price));
}


function getDataFromLocalStorage()
{
    var existingTableStorage = localStorage.getItem(tableDataStorage);

    if(existingTableStorage == null || (typeof(existingTableStorage) == "undefined") || existingTableStorage == "undefined")
        return null;

    var existingTableData = JSON.parse(existingTableStorage);
    if(existingTableData == null)
        return null;

    return existingTableData;
}

function checkPriceInput(input) {
    if (!isNaN(input)) {//number
        if (input > 0) {
            return true;
        }
    }
    return false; //not a number
}

function checkQuantityInput(input) {
    if (!isNaN(input)) {//number
        if (input > 0 && Number.isInteger(input)) {
            return true
        }
    }
    return false; //not a number
}

function getConfirmation() {
    var retVal = confirm("Do you want to continue ?");
    if (retVal == true) {
        return true;
    }
    else {
        return false;
    }
}