import { expect } from 'chai';
import 'mocha';
import {getDummyCourse} from "../../generators/dummy";
import {getDummySession} from "../../generators/dummysession";
import {shallow} from "enzyme";
import AddQuestion from "../../../components/includes/AddQuestion";
import React from "react";
import {MOBILE_BREAKPOINT} from "../../../components/includes/SessionQuestionsContainer";

describe('AddQuestion', function(){
    // Perform setup
    const course = getDummyCourse();
    const session : FireSession = getDummySession(course.courseId);
    it('should display correctly', function(){
        const wrapper = shallow(<AddQuestion
            session={session}
            course={course}
            mobileBreakpoint={MOBILE_BREAKPOINT}
        />);
        // TODO: Test
    });
});
