var idx = 0;

const emptyStringError = "Pole nie może być puste!";
const invalidNumberString = "Błędna wartość!";
const tableDataStorage = "tableData";

window.onload = function () {
    let d = new Date();
    let dateString = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear().toString().substring(2);

    $('#header_date').text(dateString);
    $('#header_id').text(getIdFromLocalStorage());

    loadLocalStorageToTable();

    let storage = getDataFromLocalStorage();
    idx = storage == null ? 0 : storage.length;

    $('#itemContainer').on('click', 'button.deleteItem', function () {
        var row = $(this).parents('tr');
        var row_id = row.children().first()[0].textContent;

        row.remove();

        updateTableId();
        removeItemFromLocalStorage(row_id);
    });

    $('#itemContainer').on('click', 'button.moveUp', function () {
        var row = $(this).parents('tr');
        var row_id = row.children().first()[0].textContent;

        moveRows(true, row_id, row);
    });

    $('#itemContainer').on('click', 'button.moveDown', function () {
        var row = $(this).parents('tr');
        var row_id = row.children().first()[0].textContent;

        moveRows(false, row_id, row);
    });


    $('body').on('click', '[data-editable]', function () {
        var $el = $(this);

        var field_name = $el.parents('td').attr('class');

        var row = $el.parents('tr');
        var row_id = row.children().first()[0].textContent;


        var $input = $('<input/>').val($el.text());
        $el.replaceWith($input);


        var save = function () {
            var existingTableData = getDataFromLocalStorage();
            if (existingTableData == null)
                return;


            var $span = $('<span data-editable />').text($input.val());
            existingTableData[row_id - 1][field_name] = $input.val();

            $input.replaceWith($span);
            localStorage.setItem(tableDataStorage, JSON.stringify(existingTableData));
            updateTableSum();
        };

        /**
          We're defining the callback with `one`, because we know that
          the element will be gone just after that, and we don't want 
          any callbacks leftovers take memory. 
          Next time `p` turns into `input` this single callback 
          will be applied again.
        */
        $input.one('blur', save).focus();

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

Array.prototype.swap = function (x,y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
  }


function moveRows(up, row_id, row) {
    var existingTableData = getDataFromLocalStorage();
    if (existingTableData == null)
        return;

    swapRowsInDataStorage(existingTableData, row_id, up);
    swapRowsInTable(existingTableData, row, row_id, up);

    localStorage.setItem(tableDataStorage, JSON.stringify(existingTableData));
}
function swapRowsInDataStorage(existingTableData, row_id, prev) {
    var currRowIndex = row_id - 1;
    var toSwapRowIndex = prev == true ? row_id - 2 : row_id;

    existingTableData.swap(currRowIndex, toSwapRowIndex);
    existingTableData[currRowIndex].id = row_id;
    existingTableData[toSwapRowIndex].id = row_id - 1;
}

function swapRowsInTable(existingTableData, row, row_id, prev) {
    var toSwapTableRow = prev == true ? row.prev() : row.next();
    var currTableRow = row;

    var currRowIndex = row_id - 1;
    var toSwapRowIndex = prev == true ? row_id - 2 : row_id;

    toSwapTableRow.find('td.name p span').text(existingTableData[toSwapRowIndex].name);
    currTableRow.find('td.name p span').text(existingTableData[currRowIndex].name);

    var prevQuantity = existingTableData[toSwapRowIndex].quantity;
    var currQuantity = existingTableData[currRowIndex].quantity;

    toSwapTableRow.find('td.quantity p span').text(prevQuantity);
    currTableRow.find('td.quantity p span').text(currQuantity);
    
    var prevPrice = existingTableData[toSwapRowIndex].price;
    var currPrice = existingTableData[currRowIndex].price;

    toSwapTableRow.find('td.price p span').text(prevPrice);
    currTableRow.find('td.price p span').text(currPrice);

    toSwapTableRow.find('td.total p span').text(prevQuantity * prevPrice);
    currTableRow.find('td.total p span').text(currQuantity * currPrice);
}

function setMoveButtons() {
    $("#itemContainer tr .move-up button").css("visibility", "visible");
    $("#itemContainer tr .move-down button").css("visibility", "visible");

    $("#itemContainer tr:first .move-up button").css("visibility", "hidden");
    $("#itemContainer tr:last .move-down button").css("visibility", "hidden");

    $("#itemContainer tr:only-child .move-up button").css("visibility", "hidden");
    $("#itemContainer tr:only-child .move-down button").css("visibility", "hidden");

}

function updateTableId() {
    idx = -1;

    $('#itemContainer > tr').find('td:first').text(function (i) {
        return i + 1;
    })
}

function updateTableSum() {
    var existingTableData = getDataFromLocalStorage();
    var $totalField = $(".totalValue p span");

    if (existingTableData == null)
        $totalField.val("0");
    else {
        var sum = 0;
        // existingTableData.forEach(item => sum += item.quantity * item.price)

        $('#itemContainer > tr > .total > p > span').text(function () {

            var row = $(this).parents('tr');
            var row_id = row.children().first()[0].textContent;
            var data_row = existingTableData[row_id - 1];

            var sub_sum = data_row.quantity * data_row.price;
            sum += sub_sum;

            return sub_sum;
        });

        $totalField.text(sum);
    }
}

function addItemToLocalStorage(id, name, quantity, price) {
    var existingTableData = getDataFromLocalStorage();

    if (existingTableData == null)
        existingTableData = [];

    existingTableData.push({ id: id, name: name, quantity: quantity, price: price }); 
    localStorage.setItem(tableDataStorage, JSON.stringify(existingTableData));

    updateTableSum();
}

function removeItemFromLocalStorage(id) {
    var existingTableData = getDataFromLocalStorage();
    if (existingTableData == null)
        return;

    idx = 0;

    existingTableData = existingTableData.filter(item => item.id != id)
    existingTableData.forEach(item => item.id = ++idx)

    localStorage.setItem(tableDataStorage, JSON.stringify(existingTableData));

    updateTableSum();
}

function addItemToTable(id, name, quantity, price) {
    var newElement = $("#itemPattern").clone();

    newElement.find(".id").text(id);
    newElement.find(".name p span").text(name);
    newElement.find(".quantity p span").text(quantity);
    newElement.find(".price p span").text(price);

    var total = parseFloat(quantity) * parseFloat(price);
    newElement.find(".total p span").text(total);
    newElement.removeAttr("id");

    $("#itemContainer").append(newElement);
    newElement.show();

    setMoveButtons();
}

function loadLocalStorageToTable() {
    var existingTableData = getDataFromLocalStorage();
    if (existingTableData == null)
        return;

    existingTableData.forEach(item => addItemToTable(item.id, item.name, item.quantity, item.price));

    setMoveButtons();
    updateTableSum();
}

function getDataFromLocalStorage() {
    var existingTableStorage = localStorage.getItem(tableDataStorage);

    if (existingTableStorage == null || (typeof (existingTableStorage) == "undefined") || existingTableStorage == "undefined")
        return null;

    var existingTableData = JSON.parse(existingTableStorage);
    if (existingTableData == null)
        return null;

    return existingTableData;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getIdFromLocalStorage() {
    var id = localStorage.getItem("id");

    if (id == null || (typeof (id) == "undefined") || id == "undefined") {
        localStorage.setItem("id", 0);
        return "000";
    }

    localStorage.setItem("id", parseInt(id)+1);
    return pad(parseInt(id) % 1000, 3);
}



function checkPriceInput(input) {
    if (!isNaN(input)) { //number
        var z1 = /^[+]?(?=.)(?:\d+,)*\d*(?:\.\d+)?$/;
        if (z1.test(input)) {
            return true;
        }
    }
    return false; //not a number
}

function checkQuantityInput(input) {
    if (!isNaN(input)) { //number
        var z1 = /^[+]?(?=.)(?:\d+,)*\d*(?:\.\d+)?$/;
        if (z1.test(input) && Number.isInteger(input)) {
            return true
        }
    }
    return false; //not a number
}

function getConfirmation() {
    var retVal = confirm("Do you want to continue ?");
    if (retVal == true) {
        return true;
    } else {
        return false;
    }
}