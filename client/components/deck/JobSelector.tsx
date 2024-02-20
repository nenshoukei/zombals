import { Button, cn, Radio, RadioGroup, RadioProps } from '@nextui-org/react';
import { useState } from 'react';
import styles from './JobSelector.module.css';
import { Job, jobNameMap, JOBS } from '@/types';

export type JobSelectorProps = {
  onSelect: (job: Job) => void;
};

const jobDescriptionMap: Record<Job, string> = {
  [Job.WARRIOR]: '武器の扱いに長けた戦士。自ら積極的に攻撃するスタイルが特徴。様々な装備を駆使して敵を打倒する。',
  [Job.WIZARD]: '強力な魔法を駆使する魔法使い。特技カードの扱いが得意。魔法で相手に直接大ダメージを与える。',
  [Job.FIGHTER]: '武術に精通した武闘家。ドロー能力と小回りの効く技が特徴。連続してカードを使う事でコンボを決める。',
  [Job.PRIEST]: '回復魔法が得意な僧侶。傷ついた味方を癒やす守りのスタイル。敵からの攻撃を耐えて猛反撃を狙う。',
  [Job.MERCHANT]: '様々な道具を扱う商人。道具で味方を強化できる。優位を築いて盤面を制圧するスペシャリスト。',
  [Job.FORTUNE]: '占いで人々を導く占い師。2つの効果のどちらかが発動する占い効果が特徴。どんな苦境でも一発逆転。',
  [Job.EVIL]: '強大な魔力を持つ魔剣士。自身のMPを増加できる。強力なカードをいち早く展開して敵を圧倒する。',
  [Job.THIEF]: '素早く敵を翻弄する盗賊。相手のカードを盗む事ができる。トリッキーな動きで致命の一撃を与える。',
};

export function JobSelector({ onSelect }: JobSelectorProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  return (
    <div className="flex flex-1 gap-2">
      <RadioGroup
        aria-label="職業の選択リスト"
        value={String(selectedJob ?? '')}
        onChange={(ev) => setSelectedJob(parseInt(ev.target.value, 10) as Job)}
        classNames={{ wrapper: 'gap-1 md:gap-2' }}
      >
        {JOBS.map((job) => (
          <CustomRadio key={job} job={job} value={String(job)}>
            {jobNameMap[job].ja}
          </CustomRadio>
        ))}
      </RadioGroup>

      {selectedJob ? (
        <div className={`${styles.selected} ${selectedJob ? `job-bg-${selectedJob}` : ''} flex-1 flex flex-col justify-end`}>
          <div className="bg-opacity-80 bg-default-100 rounded-lg mx-5 px-4 py-2 text-sm md:text-medium">
            {jobDescriptionMap[selectedJob]}
          </div>
          <Button
            variant="solid"
            color="primary"
            size="lg"
            className="m-5 shadow-md shadow-black"
            onPress={() => {
              onSelect(selectedJob);
            }}
          >
            この職業を使う
          </Button>
        </div>
      ) : null}
    </div>
  );
}

const CustomRadio = ({ job, children, ...props }: { job: Job } & RadioProps) => {
  return (
    <Radio
      {...props}
      classNames={{
        base: cn(
          `${styles.radio} job-bg-${job} bg-default/40 hover:bg-default/20 rounded-lg relative`,
          'inline-flex m-0 items-center justify between backdrop-blur-md',
          'cursor-pointer rounded-lg py-0 px-2 border-2 border-transparent',
          'data-[selected=true]:border-primary min-w-[300px]',
        ),
        labelWrapper: 'bg-default/80 px-2 md:py-1 rounded-lg',
        label: 'text-xl md:text-2xl',
      }}
    >
      {children}
    </Radio>
  );
};
