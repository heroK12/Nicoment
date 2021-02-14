window.onload = function(){

    //システムサーバー接続変数
    let embeddedData;
    let webSocketUrl;

    //コメントセッション接続用
    let msgServerUri;
    let threadId;
    let msg_comment;

    //WebSocket接続変数
    let websocket_system;
    let websocket_comment;

    //nicoment.html要素取得
    let CommentTable = document.getElementById('CommentTable');

    //Tbody作成
    let creteTbody = CommentTable.createTBody();

    //ページ最下部設定
    let pageBottom = true;

    //配信開始時刻
    let beginStreamTime;

    //システムサーバに送るメッセージ
    const sendMessage1 = '{"type":"startWatching","data":{"stream":{"quality":"abr","protocol":"hls","latency":"low","chasePlay":false},"room":{"protocol":"webSocket","commentable":true},"reconnect":false}}';
    const sendMessage2 = '{"type":"getAkashic","data":{"chasePlay":false}}';


    chrome.runtime.onMessage.addListener(
        function(request,sender,sendResponse){
            if(request["liveUrl"]){
                const UrlData = request["liveUrl"];
                CommentTable.value = "";
                getWebScoektUrl(UrlData);
            }
            sendResponse({response: "listeher is successful"});
        }
    );

    //WebSocketUrl取得後接続する
    function getWebScoektUrl(UrlData){
        $.ajax({
            url: UrlData,
            type: 'GET',
            dataType: 'html'
          })
          .done(function(data) {
            let div = document.createElement('div');
            div.innerHTML = data;
            let text = div.getElementsByTagName("script");
            for(let i = 0; i < text.length; i++){
                if(text.item(i).id == "embedded-data"){
                    embeddedData = JSON.parse(text.item(i).getAttribute("data-props"));
                    webSocketUrl = embeddedData.site.relive.webSocketUrl;
                    //console.log(webSocketUrl);
                }
            }
            connectWebsocketSystem(webSocketUrl);
          })
          .fail(function() {
              return;
          });
    }

    //Systemサーバー接続用
    function connectWebsocketSystem(webSocketUrl){
        websocket_system = new WebSocket(webSocketUrl);
        websocket_system.onopen = function(e){onOpenSystem(e)};
        websocket_system.onclose = function(e){onCloseSystem(e)};
        websocket_system.onmessage = function(e){onMessageSystem(e)};
        websocket_system.onerror = function(e){onErrorSystem(e)};
    }

    //システムセッション確立時に実行
    function onOpenSystem(e){
        //console.log("Connect to System Server");
        doSendSystemMsg(sendMessage1);
        doSendSystemMsg(sendMessage2);
    }

    //システムセッション切断時に実行
    function onCloseSystem(e){
        //console.log("Disconnet from System Server");
        websocket_comment.close();
    }

    //システムセッションからメッセージを受信したとき
    function onMessageSystem(e){
        //console.log("Response from System Server" + e.data);
        let is_room = e.data.indexOf("room");
        let is_ping = e.data.indexOf("ping");
        let is_schedule = e.data.indexOf("schedule");

        if(is_room > 0){
            let e_dataJson = JSON.parse(e.data);
            msgServerUri = e_dataJson.data.messageServer.uri;
            threadId =  e_dataJson.data.threadId;
            msg_comment = '[{"ping":{"content":"rs:0"}},{"ping":{"content":"ps:0"}},{"thread":{"thread":"'+threadId+'","version":"20061206","user_id":"guest","res_from":-150,"with_global":1,"scores":1,"nicoru":0}},{"ping":{"content":"pf:0"}},{"ping":{"content":"rf:0"}}]'

            connect_WebSocket_comment();
        }

        if(is_ping > 0){
            doSendSystemMsg('{"type":"pong"}');
            doSendSystemMsg('{"type":"keepSeat"}');
        }

        //配信開始時刻取得
        if(is_schedule > 0){
            let e_scheduleData = JSON.parse(e.data);
            //UNIX時間
            beginStreamTime = Date.parse(e_scheduleData.data.begin) / 1000;
        }

    }

    //システムサーバエラー発生時実行
    function onErrorSystem(e){
        websocket_system.close();
        //console.log("Error from System Server: " + e.data);
    }

    //システムセッションにMessageを送る
    function doSendSystemMsg(msg){
        //console.log("Send to System Server: " + msg);
        websocket_system.send(msg);
    }

    //コメントサーバ接続用
    function connect_WebSocket_comment(){
        websocket_comment = new WebSocket(msgServerUri, 'niconama', {
            headers: {
            'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
            'Sec-WebSocket-Protocol': 'msg.nicovideo.jp#json',
            },
        });

        websocket_comment.onopen = function(e){onOpenComment(e)};
        websocket_comment.onclose = function(e){onCloseComment(e)};
        websocket_comment.onmessage = function(e){onMessageComment(e)};
        websocket_comment.onerror = function(e){onErrorComment(e)};
    }

    //コメントサーバ接続時
    function onOpenComment(e){
        //console.log("Connect to Comment Server");
        doSendCommentMsg(msg_comment);
    }

    //コメントサーバ切断時
    function onCloseComment(e){
        //console.log("Disconnect to Comment Server");
        websocket_comment.close();
    }

    //コメントサーバ受信時
    function onMessageComment(e){
        //console.log("Response from System Server: " + e.data);

        let is_chat = e.data.indexOf("chat");
        if (is_chat > 0){
            //Jsonより情報取得
            let msgJson = JSON.parse(e.data);
            let commentNo = msgJson.chat.no;
            let msg_user_id = msgJson.chat.user_id;
            let commentTime = msgJson.chat.date;
            let comment = msgJson.chat.content;
            let adminComment;

            //コメント種別
            if(msgJson.chat.premium){
                adminComment = msgJson.chat.premium;
            }
            console.log(adminComment);
            // テーブル追加処理
            let rowCount = CommentTable.rows.length;
            let newRow = creteTbody.insertRow(rowCount-1);

            //コメント番号
            let newCell = newRow.insertCell();
            let newtext = document.createTextNode(commentNo);
            newCell.className ="no";
            newCell.appendChild(newtext);

            //ユーザーID
            newCell = newRow.insertCell();
            newtext = document.createTextNode(msg_user_id);
            newCell.className ="userid";
            newCell.appendChild(newtext);

            //コメント時間(投稿時間)
            newCell = newRow.insertCell();
            newtext = document.createTextNode(UnixToDatetime(commentTime - beginStreamTime));
            newCell.className ="time";
            newCell.appendChild(newtext);

            //コメント内容
            newCell = newRow.insertCell();
            newtext = document.createTextNode(comment);
            if(adminComment == '3'){
                newCell.className ="comment comment_red";
            }else{
                newCell.className = "comment";
            }
            newCell.appendChild(newtext);

            $('table').resizableColumns({
                store: window.store
            });
            
            //ページ最下部だった場合は自動スクロール
            if (pageBottom){
                let element = document.documentElement;
                let bottom = element.scrollHeight - element.clientHeight;
                window.scroll(0, bottom);
            }
        }
    }
    
    //コメントサーバエラー時
    function onErrorComment(e){
        websocket_comment.close();
        //console.log("Error from Comment Server");
    }


    //コメントサーバに送信用
    function doSendCommentMsg(msg){
        //console.log("Send to Comment Server: " + msg );
        websocket_comment.send(msg);
    }

    //UNIX時間をDateタイムにする
    function UnixToDatetime(commentTime){
        let dateTime = new Date(commentTime * 1000);
        return dateTime.toLocaleTimeString('ja-JP',{ timeZone: 'Africa/Abidjan' });
    }

    //スクロール検知
    $(window).on("scroll", function() {
        var scrollHeight = $(document).height();
        var scrollPosition = $(window).height() + $(window).scrollTop();
        if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
            pageBottom = true;
        }else{
            pageBottom = false;
        }
    });
}
