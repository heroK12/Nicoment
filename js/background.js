// TabId保存
let extWindow = '';

// PopWindowId保持
let popWindowId = '';

// ライブURL
let NicoliveUrl = '';

// アイコンクリック時(機能削除)
// chrome.browserAction.onClicked.addListener(function(){
//     window.open('nicoment.html', "window_name", "width=1000,height=700,scrollbars=yes");
// });

//ページ更新があった場合
chrome.tabs.onUpdated.addListener(function(tabid, info,tab){
    if (info.status === 'complete' && tab.url.indexOf('https://live2.nicovideo.jp/watch/') !== -1) {
        chrome.tabs.executeScript(null, { file: 'js/content.js' }, () => {});
    }
  });

//ContentからMessage取得し、popフラグだった場合開く
chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
        if(request["pop"] == "true"){
            chrome.windows.getAll({}, function(window_list) {
                window_list.forEach(function(chromeWindow) {
                    //Check windows by type
                    if (chromeWindow.id == extWindow && NicoliveUrl == request["url"]) {
                        extWindow = chromeWindow.id;
                        //Update opened window
                        chrome.windows.update(extWindow, {focused: true});

                        //別配信だった場合
                        if(NicoliveUrl != request["url"]){
                            waitPageLoad(popWindowId);
                        }
                        NicoliveUrl = request["url"];
                        return;
                    }
                });
            
                if (extWindow == '' || NicoliveUrl != request['url']) {
                    NicoliveUrl = request["url"];
                    //Open window
                    chrome.windows.create(
                        {
                            'url'       : 'nicoment.html',
                            'type'      : 'popup',
                            'width': 1000, 
                            'height': 700,
                            'focused'   : true
                        },
                        function(chromeWindow) {
                            popWindowId = chromeWindow.windowId
                            extWindow = chromeWindow.id;
                            waitPageLoad(popWindowId);
                        }
                    );
                }
            });
            
        }
    }
);

//ページ完全に開くまで待つ
function waitPageLoad(chromeWindow) {
    // 取得するタブの条件
    const queryInfo = {
        active: true,
        currentWindow: true, 
        windowId: popWindowId
    };

    // タブの情報を取得する
    chrome.tabs.query(queryInfo, function(tabs) {

        let currentTab = tabs[0];

        if (currentTab.status === 'complete') {
            chrome.tabs.sendMessage(tabs[0].id, {liveUrl: NicoliveUrl}, function(response) {   

            });
        } else {
            setTimeout(() => {
                // まだロード中だった場合は、ちょっとwaitして再帰的にこの処理を繰り返す
                waitPageLoad(popWindowId);
            }, 50);
        }
    });
}

  //子ページ削除時Tabid初期化
chrome.windows.onRemoved.addListener(function(windowId){
    console.log(windowId);
    if(extWindow == windowId){
        extWindow = '';
    }
});