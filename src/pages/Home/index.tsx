import { FC } from 'react';
import QueueAnim from 'rc-queue-anim';
import OverPack from 'rc-scroll-anim/lib/ScrollOverPack';
import { Row, Col } from 'antd';
import './style';

interface Data {
  title: string;
  content: string;
  src: string;
}

const HomePage: FC = () => {
  const data: Data[] = [
    {
      title: 'UMIJS',
      content: 'Routing, Server-side rendering (SSR), Internationalization (i18n), TypeScript support',
      src: 'https://umijs.org/images/og-home.png',
    },
    {
      title: 'SUPABASE',
      content: 'BaaS, Auth',
      src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQyu74dDPHYpCINs5AIb8MYSq2-1gScU0y9g&s.png',
    },
    {
      title: 'TYPESCRIPT',
      content: 'Phát hiện lỗi sớm, tính modules, TypeScript Compiler (TSC)',
      src: 'https://blog.theodo.com/_astro/ts_logo.BstCNrTU_1Dbxpr.webp',
    },
  ]

  const children = data.map((d: Data, i: any) => (
    <QueueAnim
      component={Col}
      key={i}
      type="bottom"
      className='col'
      componentProps={{ span: 8 }}
    >
      <div key="image" className="image" style={{ backgroundImage: `url(${d.src})` }} />
      <h3 key="h3">{d.title}</h3>
      <p key="p">{d.content}</p>
    </QueueAnim>
  ));
  return (
    <div className="home-layout-wrapper home-func-wrapper" id="home-func" >
      <h2>Công nghệ sử dụng</h2>
      <i className="line" />
      <OverPack className="home-layout" location="home-func" playScale={0.4}>
        <QueueAnim className="home-func" type="bottom" key="home-func" ease="easeOutQuart" leaveReverse>
          <QueueAnim
            key="content"
            component={Row}
            type="bottom"
            componentProps={{ gutter: 171 }}
          >
            {children}
          </QueueAnim>
        </QueueAnim>
      </OverPack>
    </div>);
}

export default HomePage;