(function() {

    //現在のURL
    let url = location.href;

    //DOM親要素
    let DomParentElement = document.querySelector("#root > div > div.___player-area___1IipP > div.___player-body-area___3W2NR > div > div > div.___player-status___BQ7B7 > div.___contents-tab-panel___19HaA.___contents-tab-panel___3Wgcp > div.___tab-area___3ACye > div.___ng-setting-controller___2aD6J.___ng-setting-controller___2aA2S");

    //DOM挿入要素
    let DomChildElementStr = "<button id='CommentViewerPop' class='___ng-setting-popup-button___2xTIw ___ng-setting-popup-button___yBxaP ___ga-ns-ng-setting-popup-button___26Lpn'aria-label='コメントビューア' type='button'><svg id='openWindowIcon' viewBox='0 0 233.336 200'><path d='M179.169 116.665h-8.334c-1.217 0-2.216.39-2.993 1.173-.784.779-1.173 1.777-1.173 2.993v41.667c0 5.73-2.039 10.633-6.118 14.714-4.08 4.08-8.985 6.118-14.715 6.118H37.5c-5.729 0-10.634-2.038-14.715-6.118-4.08-4.08-6.119-8.984-6.119-14.714V54.164c0-5.729 2.039-10.632 6.119-14.712s8.985-6.119 14.715-6.119h91.667c1.217 0 2.216-.392 2.996-1.172.78-.781 1.17-1.779 1.17-2.995V20.83c0-1.214-.39-2.213-1.17-2.993-.78-.781-1.779-1.171-2.996-1.171H37.5c-10.329 0-19.162 3.668-26.498 11.003C3.668 35.003 0 43.836 0 54.165V162.5c0 10.329 3.668 19.163 11.002 26.495C18.338 196.33 27.171 200 37.5 200h108.335c10.329 0 19.163-3.67 26.498-11.005 7.336-7.332 11.004-16.166 11.004-26.495v-41.665c0-1.217-.39-2.216-1.174-2.996-.781-.784-1.78-1.174-2.994-1.174z'></path><path d='M230.86 2.474C229.211.824 227.255 0 225 0h-66.667c-2.257 0-4.211.824-5.859 2.474-1.65 1.649-2.476 3.602-2.476 5.859s.826 4.211 2.476 5.86L175.39 37.11l-84.895 84.897c-.869.868-1.303 1.867-1.303 2.993 0 1.131.435 2.129 1.303 2.997l14.844 14.842c.868.868 1.867 1.301 2.995 1.301 1.128 0 2.128-.432 2.995-1.301l84.896-84.896 22.918 22.916c1.648 1.65 3.602 2.475 5.859 2.475s4.211-.825 5.861-2.475c1.65-1.649 2.474-3.602 2.474-5.859V8.333c-.002-2.259-.829-4.211-2.477-5.859z'></path></svg></button>"

    //文字列をElementに変換
    function createElementFromHTML(html) {
        const tempEl = document.createElement('div');
        tempEl.innerHTML = html;
        return tempEl.firstElementChild;
    }

    //親要素CSS
    DomParentElement.style.display = 'flex';
    
    //要素挿入
    DomChildElement = createElementFromHTML(DomChildElementStr);
    DomParentElement.appendChild(DomChildElement);
    

    //配信ページでコメントビューアアイコンクリック時、発火させる
    let CommentViewerPop = document.getElementById("CommentViewerPop");
    CommentViewerPop.addEventListener('click',function(){
        chrome.runtime.sendMessage({pop: "true",url: url}, function(response) {
            //console.log(response.farewell);
        });
    })
})();