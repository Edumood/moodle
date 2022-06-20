define(['jquery', 'core/ajax', 'mod_printitlite/jqueryjsignature'],
    function($, Ajax, Str, ModalFactory, ModalEvents, Notification, CustomEvents, Templates) {

        /**
         * Init this module which allows activity completion state to be changed via ajax.
         * @method init
         * @param {string} fullName The current user's full name.
         * @private
         */
        const init = function (field_id, color, backgroundColor,$requiredsingature) {
            let signatureInput = $("#signature").attr('style','display:none !important');
            let defaultSignature = $("#signature").val();
            let signatureWidget = $('<div class="printitlite-jsignature-editor" id="jsignature' + field_id + '">')
                .insertAfter(signatureInput)
                .jSignature({
                    'background-color': backgroundColor,
                    'sizeRatio' : 3,
                    'color': color,
                    'readOnly': signatureInput.is(':disabled'),
                    'signatureLine': true,
                    'showUndoButton': true,
                })

            if (defaultSignature) {
                signatureWidget.jSignature('setData', defaultSignature, 'base30');
            }else{
                $('#signdocument').prop('disabled',true);
                if($("#download").attr('requiresignature')==1){
                    $("#download").attr('style','pointer-events:none !important');
                    $("#download").attr('disabled','disabled');
                }
            }

            signatureWidget.on("change",function(event) {
                let data = signatureWidget.jSignature("getData", "base30")[1];
                $("#signature").val(data);
                if(data.length > 15){
                    $('#signdocument').prop('disabled',false);
                    $("#download").attr('style','');
                    $("#download").removeAttr('disabled');
                }else{
                    $('#signdocument').prop('disabled',true);
                    $("#download").attr('style','pointer-events:none !important');
                    $("#download").attr('disabled','disabled');
                }
            });

            $('#signdocument').on("click",function(event) {
                var documentid =this.getAttribute('documentid');
                let data = signatureWidget.jSignature("getData", "base30")[1];
                console.log('signature '+ data + ' documentid ' + documentid);
                if(data.length > 15){
                    Ajax.call([{
                        methodname: 'mod_printitlite_save_signature',
                        args: {documentid: documentid, signature:data},
                        done:function (element) {
                            $('#documentpreview').html(element);
                            var _href = $('#download').attr("href");
                            $('#download').attr('href',_href + Date.now());
                        }
                    }]);
                }
                var datapair = signatureWidget.jSignature("getData", "svgbase64");
                var i = new Image(8+'em');
                i.src = "data:" + datapair[0] + "," + datapair[1];
                i.classList.add('printitlite-signature-img');
                $("#signatureimage").html(i);
            });

            $('#unsigndocument').on("click",function(event) {
                var documentid =this.getAttribute('documentid');
                console.log( 'deleted document signature for documentid ' + documentid);
                    Ajax.call([{
                        methodname: 'mod_printitlite_delete_signature',
                        args: {documentid: documentid},
                        done:function (element) {
                            $('#documentpreview').html(element);
                        }
                    }]);
                signatureWidget.jSignature("reset")
                $("#signature").val('');
                $('#signatureimage').html('................');
                var _href = $('#download').attr("href");
                $('#download').attr('href',_href + Date.now());
            });

            $('#download').on("click",function(event) {
                var documentid =this.getAttribute('documentid');
                let data = signatureWidget.jSignature("getData", "base30")[1];
                if(data.length > 15){
                    Ajax.call([{
                        methodname: 'mod_printitlite_save_signature',
                        args: {documentid: documentid, signature:data},
                        done:function (element) {
                            $('#documentpreview').html(element);
                            var _href = $('#download').attr("href");
                            $('#download').attr('href',_href + Date.now());
                        }
                    }]);
                }
            });
        };

        return {
            init: init
        };
});
