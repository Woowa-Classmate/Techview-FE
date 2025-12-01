const Title1 = ({ text }: { text: string }) => {
  return (
    <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
      {text}
    </h1>
  );
};

export default Title1;
