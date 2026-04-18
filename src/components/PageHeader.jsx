const PageHeader = ({ title, description, actions, search }) => {
  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-3 md:px-6 py-3 md:py-4 hidden md:block">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">{description}</p>
        </div>
        {search && <div className="flex-1 md:max-w-2xl">{search}</div>}
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
