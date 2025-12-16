export function DashboardContent() {
  // Kibana 대시보드 URL - 우리두리 소비패턴 대시보드
  const kibanaBaseUrl = import.meta.env.VITE_KIBANA_URL || "http://localhost:5601";
  const dashboardId = "b29c7ec0-c9a6-11f0-a859-c141cef40fe7";
  
  // 시간 범위를 1년으로 설정: from:now-1y, to:now
  // Time filter와 Filter bar만 표시하도록 설정
  const kibanaUrl = `${kibanaBaseUrl}/app/dashboards#/view/${dashboardId}?embed=true&show-time-filter=true&hide-filter-bar=false&show-query-input=false&show-top-menu=false&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1y,to:now))&_a=(description:'',filters:!(),fullScreenMode:!f,options:(hidePanelTitles:!f,useMargins:!t),query:(language:kuery,query:''),timeRestore:!f,title:'%EC%9A%B0%EB%A6%AC%EB%91%90%EB%A6%AC%20-%20%EC%86%8C%EB%B9%84%ED%8C%A8%ED%84%B4',viewMode:view)`;

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0a0a0a]">
      <iframe
        src={kibanaUrl}
        width="100%"
        height="100%"
        className="w-full h-full border-0"
        title="소비 패턴 분석 대시보드"
      />
    </div>
  )
}

