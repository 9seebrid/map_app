// 하단 디테일 박스 숨김 및 보임 기능
const detailGuide = document.querySelector('.guide');
const guideIcon = document.querySelector('.guide i');
const detailBox = document.querySelector('.detail_box');
const detailHeight = detailBox.offsetHeight;

detailBox.style.bottom = -detailHeight + 'px'; // 디테일 박스 높이만큼 숨김
// detailBox.style.bottom = 0;

detailGuide.addEventListener('click', function () {
  // 클릭을하면 액티브 상태가 되고 액티브 상태일때 디테일 박스가 보임
  this.classList.toggle('active');
  if (this.classList.contains('active')) {
    // 액티브 상태일때 가이드 아이콘 표시 아래로 변경
    guideIcon.setAttribute('class', 'ri-arrow-drop-down-line');
    detailBox.style.bottom = 0;
  } else {
    // 액티브 상태가 아닐때 가이드 아이콘 표시 아래로 변경
    guideIcon.setAttribute('class', 'ri-arrow-drop-up-line');
    detailBox.style.bottom = -detailHeight + 'px';
  }
});

//데이터 기준일자 23년 10월보다 크고 위도 경도가 있는 데이터만 추출
const currentData = data.records.filter(
  (item) => item.데이터기준일자.split('-')[0] >= '2023' && item.데이터기준일자.split('-')[1] >= '10' && item.위도 !== ''
);

// 검색 버튼 기능
const searchBtn = document.querySelector('.search button');
// 검색 버튼
const searchInput = document.querySelector('.search input'); // 검색 입력창
const mapElmt = document.querySelector('#map');
const loading = document.querySelector('.loading'); // 로딩 이미지

// 검색 버튼 클릭 시 실행 함수
searchBtn.addEventListener('click', function () {
  const searchValue = searchInput.value; // 입력값 저장

  if (searchInput.value === '') {
    alert('검색어를 입력해주세요');
    searchInput.focus(); // 커서 입력창에 포커스
    return;
  } // 검색어 없이 클릭할 경우 알림

  const searchResult = currentData.filter(
    (item) => item.도서관명.includes(searchValue) || item.시군구명.includes(searchValue)
  ); // 검색어와 일치하는 데이터만 추출

  if (searchResult.length === 0) {
    alert('검색 결과가 없습니다.');
    searchInput.value = ''; // 검색어 초기화
    searchInput.focus(); // 커서 입력창에 포커스
    return;
  } else {
    mapElmt.innerHTML = ''; // 검색시 기존 지도 삭제
    startLenderMap(searchResult[0].위도, searchResult[0].경도);
    searchInput.value = ''; // 검색어 초기화
  }
});

//네이버 맵 적용 : 현재 위치 검색

navigator.geolocation.getCurrentPosition((position) => {
  // console.log(position);
  const lat = position.coords.latitude; // 위도를 가져오는 함수
  const lng = position.coords.longitude; // 경도를 가져오는 함수
  console.log(lat, lng);

  startLenderMap(lat, lng); // 현재위치를 기준으로 네이버 맵을 띄우는 함수
});

// console.log(startLenderMap);

function startLenderMap(lat, lng) {
  // 네이버 맵을 띄우는 함수
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(lat, lng),
    zoom: 14, // 숫자가 높을수록 가까이 보임
  });

  var marker = new naver.maps.Marker({
    // 현재위치를 표시하는 마커
    position: new naver.maps.LatLng(lat, lng),
    map: map,
  });

  currentData.forEach((item) => {
    // 현재위치를 기준으로 화면상에 있는 도서관만 마커로 표시
    let latlng = new naver.maps.LatLng(item.위도, item.경도);
    let bounds = map.getBounds();

    if (bounds.hasLatLng(latlng)) {
      // 현재 위치를 기준으로 화면상에 있는지 확인, 화면 내부의 마커만 생성 초기에 지도가 커서 마커가 안보일 경우 보이지 않음

      var marker = new naver.maps.Marker({
        position: latlng,
        map: map,
        title: item.도서관명,
        itemCount: item['자료수(도서)'],
        serialItemCount: item['자료수(연속간행물)'],
        notBookItemCount: item['자료수(비도서)'],
        sitCount: item.열람좌석수,
        wdStart: item.평일운영시작시각,
        wdEnd: item.평일운영종료시각,
        wkStart: item.토요일운영시작시각,
        wkEnd: item.토요일운영종료시각,
        contact: item.도서관전화번호,
        address: item.소재지도로명주소,
        homePage: item.홈페이지주소,
      });

      // console.log(marker.itemCount);

      let infoWindow = new naver.maps.InfoWindow({
        // 마커 클릭시 나오는 정보창
        content: `
        <h4 style="padding: 0.25rem 0.5rem; font-size:16px; font-weight:400; color:#555;">${item.도서관명}</h4>

        `,
      });

      setTimeout(() => {
        loading.style.display = 'none'; // 로딩 이미지 숨김
      }, 800); // 느릴 경우 더 오래 걸릴 수 있기 때문에 안하는 것 추천

      naver.maps.Event.addListener(marker, 'click', function () {
        // 마커 클릭시 정보창이 열리고 닫힘
        if (infoWindow.getMap()) {
          infoWindow.close(); // infoWindow가 열려있으면 닫고
        } else {
          infoWindow.open(map, marker); // infoWindow가 닫혀있으면 열림
        }

        const markerInfoData = {
          // 마커 클릭시 나오는 정보창에 들어갈 데이터
          title: marker.title,
          itemCount: marker.itemCount,
          serialItemCount: marker.serialItemCount,
          notBookItemCount: marker.notBookItemCount,
          sitCount: marker.sitCount,
          wdStart: marker.wdStart,
          wdEnd: marker.wdEnd,
          wkStart: marker.wkStart,
          wkEnd: marker.wkEnd,
          contact: marker.contact,
          address: marker.address,
          homePage: marker.homePage,
        };
        getInfoOnMarker(markerInfoData);
      });
    }
  });

  function getInfoOnMarker(markerInfoData) {
    // 지도 마커를 클릭 했을 때 detail_wrapper 보여주도록 설정
    const infoWrapper = document.querySelector('.detail_wrapper');
    detailBox.style.bottom = 0;
    detailGuide.classList.add('active');
    guideIcon.setAttribute('class', 'ri-arrow-drop-down-line');
    // 마커 클릭시 나오는 정보창에 들어갈 데이터를 띄우는 함수
    // console.log(markerInfoData);
    infoWrapper.innerHTML = '';
    const {
      title,
      itemCount,
      serialItemCount,
      notBookItemCount,
      sitCount,
      wdStart,
      wdEnd,
      wkStart,
      wkEnd,
      contact,
      address,
      homePage,
    } = markerInfoData;
    console.log(serialItemCount); // 구조분해 할당
    const infoElmt = `
    <div class="detail_title">
            <h2>${title}</h2>
          </div>
          <div class="detail_info">
            <div class="info_1">
              <h3>도서</h3>
              <h3>${itemCount}</h3>
            </div>
            <div class="info_2">
              <h3>연속간행물</h3></h3>
              <h3>${serialItemCount}</h3>
            </div>
            <div class="info_3">
              <h3>비도서</h3>
              <h3>${notBookItemCount}</h3>
            </div>
            <div class="info_4">
              <h3>열람좌석수</h3>
              <h3>${sitCount}</h3>
            </div>
          </div>
          <div class="detail_text">
            <div class="time">
              <div class="time_title">운영시간</div>
              <div class="time_contents">
                <p class="week_day"${wdStart} ~ ${wdEnd}(평일)</p>
                <p class="week_end">${wkStart} ~ ${wkEnd}</p>
                <p class="holly_Day">공휴일 휴관</p>
              </div>
            </div>
            <div class="tell">
              <div class="tell_title">연락처</div>
              <div class="tell_contents">
                <p>${contact}</p>
              </div>
            </div>
            <div class="addr">
              <div class="addr_title">주소</div>
              <div class="addr_contents">
                <p>${address}</p>
              </div>
            </div>
            <div class="homepage">
              <div class="homepage_title">홈페이지</div>
              <div class="homepage_contents">
                <p><a href="${homePage}"> 홈페이지 이동 </a></p>
              </div>
            </div>
          </div>
    `;

    infoWrapper.insertAdjacentHTML('beforeend', infoElmt); // .detail_wrapper 다음 영역에 infoElmt 내용을 추가 - element.insertAdjacentHTML(위치, 내용)
  }
}
