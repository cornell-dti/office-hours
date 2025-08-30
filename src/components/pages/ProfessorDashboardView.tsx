import React, { useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import moment from 'moment';
import TopBar from '../includes/TopBar';
import ProfessorSidebar from '../includes/ProfessorSidebar';
import TagsBarChart from '../includes/TagsBarChart';

import { useQuery, useCourse, getTagsQuery, useQuestionsQueries } from '../../firehooks';
import { START_DATE, END_DATE } from '../../constants';

interface CategoryTag {
    category: string;
    totalQuestions: number;
    resolvedQuestions: number;
    percentResolved: number;
    childTags: {
        name: string;
        questionCount: number;
    }[];
    yMax: number;
}

// Fetching all questions for a course might be expensive/have performance implications
// This should be rarely done, though.

const ProfessorDashboardView = ({ match: { params: { courseId } } }: RouteComponentProps<{ courseId: string }>) => {
    const [currentCategory, setCurrentCategory] = useState<CategoryTag | undefined>();
    const [processedData, setProcessedData] = useState<{
        tags: FireTag[];
        questions: FireQuestion[];
        categories: CategoryTag[];
    } | null>(null);

    // this should move hooks to component level
    const tags = useQuery<FireTag>(courseId, getTagsQuery, 'tagId');
  
    const startDate = moment(new Date(START_DATE));
    const endDate = moment(new Date(END_DATE));

    const questions = useQuestionsQueries(startDate, endDate, courseId);

    const course = useCourse(courseId);

    useEffect(() => {
        if (!tags || !questions) return;

        const categories: CategoryTag[] = tags
            .filter((tag) => tag.level === 1)
            .map((tag) => {
                const enrichedChildTags: (FireTag & { questionCount: number; resolvedQuestionCount: number })[] = tags
                    .filter(t => t.parentTag && t.parentTag === tag.tagId)
                    .map(t => {
                        const tagQuestions = questions.filter(q => q.secondaryTag === t.tagId);
                        return {
                            ...t,
                            questionCount: tagQuestions.length,
                            resolvedQuestionCount: tagQuestions
                                .filter(q => q.status === 'resolved' || q.status === 'retracted')
                                .length
                        };
                    });

                const totalQuestions = enrichedChildTags
                    .reduce((acc, { questionCount }) => acc + questionCount, 0);
                const resolvedQuestions = enrichedChildTags
                    .reduce((acc, { resolvedQuestionCount }) => acc + resolvedQuestionCount, 0);

                return {
                    category: tag.name,
                    totalQuestions,
                    resolvedQuestions,
                    percentResolved: totalQuestions === 0 ? 100 : 100 * resolvedQuestions / totalQuestions,
                    childTags: enrichedChildTags.map((t) => ({
                        name: t.name,
                        questionCount: t.questionCount
                    })),
                    yMax: enrichedChildTags.reduce((acc, { questionCount }) => Math.max(acc, questionCount), 0)
                };
            });

        setProcessedData({ tags, questions, categories });
    }, [tags, questions]);

    if (!processedData) {
        return <div>Loading...</div>;
    }

    const { categories } = processedData;

    const handleUpdateCategory = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newCategoryTag = categories.find(c => c.category === data.value);
        setCurrentCategory(newCategoryTag);
    };

    const calcTickVals = (yMax: number) => {
        const end = yMax + (5 - yMax % 5);
        let start = 0;
        const step = end / 5;
        const tickVals = [];

        while (end + step >= start) {
            tickVals.push(start);
            start += step;
        }

        return tickVals;
    };

    return (
        <div className="ProfessorView">
            <ProfessorSidebar
                courseId={courseId}
                code={course ? course.code : 'Loading'}
                selected={'dashboard'}
            />
            <TopBar courseId={courseId} context="professor" role="professor" />
            <section className="rightOfSidebar">
                <div className="main">
                    <div className="Category-dropdown-container">
                        <Dropdown
                            placeholder="Select Category to View"
                            fluid={true}
                            selection={true}
                            onChange={handleUpdateCategory}
                            options={categories.map(({ category }) =>
                                ({ key: category, text: category, value: category })
                            )}
                        />
                    </div>
                    {currentCategory
                        ? <div className="category-container">
                            <p className="categoryName"> {currentCategory.category} </p>
                            <hr />
                            <div className="stats-graph-container">
                                <div className="category-stats-container">
                                    <p className="totalQuestions"> {currentCategory.totalQuestions} </p>
                                    <p className="totalQuestionsLabel"> questions total </p>
                                    <hr />
                                    <p className="percentResolved"> {Number.isInteger(currentCategory.percentResolved)? 
                                        currentCategory.percentResolved: 
                                        currentCategory.percentResolved.toFixed(2)}% </p>
                                    <p className="percentResolvedLabel"> answered </p>
                                </div>
                                <TagsBarChart
                                    barData={currentCategory ? currentCategory.childTags : []}
                                    yMax={currentCategory ? currentCategory.yMax + 1 : 1}
                                    calcTickVals={calcTickVals}
                                />
                            </div>
                        </div>
                        : <p className="SelectCategory"> Select a category to view </p>
                    }
                </div>
            </section>
        </div>
    );
};

export default ProfessorDashboardView;
