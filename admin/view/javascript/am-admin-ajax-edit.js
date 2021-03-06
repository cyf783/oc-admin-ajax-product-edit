$(function () {
    $('tbody tr:not(.filter)').each(function () {
        ProductCollection.add(new Product($(this)));
    });
});

/**
 * Product class
 */
function Product($row) {
    var id = $row.find('input[name="selected[]"]').val();

    var settings = {
        name: 'td:nth-of-type(5)',
        model: 'td:nth-of-type(6)',
        price: 'td:nth-of-type(7)',
        status: 'td:nth-of-type(9)'
    };

    var that = this;

    // Bind events
    $row.find(settings.name).click(function () {
        that.changeNameDlg();
    });
    $row.find(settings.model).click(function () {
        that.changeModelDlg();
    });
    $row.find(settings.price).click(function () {
        that.changePriceDlg();
    });
    $row.find(settings.status).click(function () {
        if ($(this).find("input").length > 0) {
            closeInput(settings.status);
        } else {
            that.changeStatusDlg();
        }
    });

    var showInput = function (container, saveCallback) {
        var $container = $row.find(container);
        if ($container.find('.live-edit').length > 0) {
            return;
        }

        var $inputTemplate = $('<input type="text" class="live-edit"/>');
        var oldVal = $container.text().trim();
        $inputTemplate.attr('value', oldVal);
        $inputTemplate.data('content', $container.html());
        $container.html('');
        $container.append($inputTemplate);

        $inputTemplate.keydown(function (e) {
            var $this = $(this);
            switch (e.keyCode) {
                case 27:
                    closeInput(container);
                    break;
                case 13:
                    saveCallback($this.val());
                    break;
            }
        });
        $inputTemplate.focus();
    };

    var closeInput = function (container) {
        var initialContent = $row.find(container + ' input.live-edit').data('content');
        $row.find(container).html(initialContent);
    };

    var saveData = function (data, container) {
        var url = 'index.php?route=catalog/product/ajaxEdit&token=<?php echo $token; ?>';
        data['product_id'] = that.id;
        $.post(url, data, function (response) {
            var msg = '';
            var $inputField = $row.find(container + " input.live-edit");

            if (typeof response.success != "undefined") {
                msg = response.success;
                $inputField.data('content', $inputField.val());
                closeInput(container);
            } else if (typeof response.error != "undefined") {
                msg = response.error;
            }

            if (msg) {
                $row.notify(msg, {position: "top center", className: "success"});
            } else {
                $row.notify('Invalid server response! Contact with your developer');
            }
        });
    };

    /**
     * Public properties and methods
     */

    this.id = id;

    this.changeNameDlg = function () {
        showInput(settings.name, that.saveName);
    };

    this.changeModelDlg = function () {
        showInput(settings.model, that.saveModel);
    };

    this.changePriceDlg = function () {
        showInput(settings.price, that.savePrice);
    };

    this.changeStatusDlg = function () {
        var $container = $row.find(settings.status);
        if ($container.find('.live-edit').length > 0) {
            return;
        }

        var oldContent = $container.text();
        var $inputTemplate = $('<input type="checkbox" class="live-edit"/>');
        $inputTemplate.data('content', oldContent);

        var onStatus = $('select[name="filter_status"] option[value="1"]').text();
        var offStatus = $('select[name="filter_status"] option[value="0"]').text();
        var currentStatus = (oldContent == onStatus) ? 'checked' : '';
        $inputTemplate.prop('checked', currentStatus);
        $container.html($inputTemplate);

        $inputTemplate.click(function (e) {
            e.stopPropagation();
            if ($inputTemplate.prop("checked")) {
                $inputTemplate.attr("value", onStatus);
            } else {
                $inputTemplate.attr("value", offStatus);
            }
            that.saveStatus(+$inputTemplate.prop("checked"));	// pass integer val
        });
    };

    this.saveName = function (name) {
        saveData({name: name}, settings.name);
    };
    this.saveModel = function (model) {
        saveData({model: model}, settings.model);
    };
    this.savePrice = function (price) {
        saveData({price: price}, settings.price);
    };
    this.saveStatus = function (status) {
        saveData({status: status}, settings.status);
    };

}

/**
 * Collection for products
 *
 * @type {{products: {}, add: Function, has: Function, get: Function}}
 */
ProductCollection = {
    products: {},

    add: function (product) {
        if (!this.has(product.id)) {
            this.products[product.id] = product;
        }

        return this.products[product.id];
    },

    has: function (id) {
        return !!this.products[id];
    },

    get: function (id) {
        return this.products[id];
    }
};
