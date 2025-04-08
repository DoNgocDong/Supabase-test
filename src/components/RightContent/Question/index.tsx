import { QuestionCircleOutlined } from '@ant-design/icons';

const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://supabase.com/docs');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};

export default Question;
